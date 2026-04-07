import discord
from discord.ext import commands
import aiohttp
import asyncio
import re
from bs4 import BeautifulSoup
import json
from urllib.parse import urlencode


class CNICLookup(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.base_url = "https://pakistandatabase.com/databases/sim.php"
        self.session = None
    
    async def create_session(self):
        """Create persistent session with proper headers"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                }
            )
        return self.session
    
    def validate_cnic(self, cnic_input):
        """Validate and format CNIC"""
        # Remove all non-digit characters
        clean_cnic = re.sub(r'[^0-9]', '', cnic_input)
        
        if len(clean_cnic) == 13:
            return clean_cnic
        return None
    
    @commands.command(name='cnic', aliases=['lookup', 'sim'])
    async def cnic_lookup(self, ctx):
        """Interactive CNIC/SIM lookup"""
        
        prompt_embed = discord.Embed(
            title="🔍 CNIC/SIM Database Lookup",
            description=(
                "```ansi\n"
                "\u001b[1;36m╔═══════════════════════════════════════════════════════╗\n"
                "\u001b[1;36m║                                                       ║\n"
                "\u001b[1;36m║        PAKISTAN DATABASE LOOKUP SYSTEM                ║\n"
                "\u001b[1;36m║                                                       ║\n"
                "\u001b[1;36m╚═══════════════════════════════════════════════════════╝\n"
                "```\n"
                "**Please enter the 13-digit CNIC number:**\n\n"
                "📝 **Format:** `XXXXX-XXXXXXX-X` or `XXXXXXXXXXXXX`\n\n"
                "**Examples:**\n"
                "`37405-1989162-8`\n"
                "`3740519891628`\n\n"
                "⏱️ **Timeout:** 60 seconds\n"
                "Type `cancel` to abort."
            ),
            color=0x00D9FF,
            timestamp=discord.utils.utcnow()
        )
        
        prompt_embed.add_field(
            name="⚠️ DISCLAIMER",
            value=(
                "```diff\n"
                "- Educational purposes only\n"
                "+ Use responsibly and legally\n"
                "+ Data from public sources\n"
                "- Respect privacy laws\n"
                "```"
            ),
            inline=False
        )
        
        prompt_embed.set_footer(text="ZeroDay Tool • Database Lookup")
        prompt_embed.set_thumbnail(url="https://flagcdn.com/w320/pk.png")
        
        await ctx.send(embed=prompt_embed)
        
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel
        
        try:
            msg = await self.bot.wait_for('message', check=check, timeout=60.0)
            
            if msg.content.lower() == 'cancel':
                await ctx.send("```\n❌ Lookup cancelled.\n```")
                return
            
            # Validate CNIC
            cnic = self.validate_cnic(msg.content)
            
            if not cnic:
                error_embed = discord.Embed(
                    title="❌ Invalid CNIC Format",
                    description=(
                        "```\n"
                        "ERROR: CNIC must be exactly 13 digits!\n\n"
                        "Valid formats:\n"
                        "• 37405-1989162-8\n"
                        "• 3740519891628\n"
                        "```"
                    ),
                    color=0xFF0000
                )
                await ctx.send(embed=error_embed)
                return
            
            # Format CNIC for display
            formatted_cnic = f"{cnic[:5]}-{cnic[5:12]}-{cnic[12]}"
            
            # Show loading
            loading_embed = discord.Embed(
                title="🔄 Searching Database",
                description=(
                    "```\n"
                    "┌───────────────────────────────────────────────────┐\n"
                    "│                                                   │\n"
                    f"│  CNIC     : {formatted_cnic}                      │\n"
                    "│  Status   : Querying Pakistan Database...        │\n"
                    "│  Progress : ████████████████░░░░  80%            │\n"
                    "│                                                   │\n"
                    "└───────────────────────────────────────────────────┘\n"
                    "```\n"
                    "⏳ **Please wait...**"
                ),
                color=0xFFA500
            )
            
            loading_msg = await ctx.send(embed=loading_embed)
            
            # Try multiple methods to fetch data
            results = await self.fetch_data_multiple_methods(cnic)
            
            await loading_msg.delete()
            
            if not results or len(results) == 0:
                # No results found
                no_result_embed = discord.Embed(
                    title="❌ No Results Found",
                    description=(
                        "```\n"
                        "╔═══════════════════════════════════════════════════════╗\n"
                        "║              NO RECORDS FOUND                         ║\n"
                        "╠═══════════════════════════════════════════════════════╣\n"
                        f"║   CNIC: {formatted_cnic}                    ║\n"
                        "║                                                       ║\n"
                        "║   Possible reasons:                                   ║\n"
                        "║   • CNIC not registered in database                   ║\n"
                        "║   • Website temporarily unavailable                   ║\n"
                        "║   • Data not publicly available                       ║\n"
                        "║                                                       ║\n"
                        "╚═══════════════════════════════════════════════════════╝\n"
                        "```"
                    ),
                    color=0xFF0000,
                    timestamp=discord.utils.utcnow()
                )
                
                no_result_embed.add_field(
                    name="💡 Suggestions",
                    value=(
                        "• Verify the CNIC number is correct\n"
                        "• Try again in a few minutes\n"
                        "• Check the website directly: https://pakistandatabase.com"
                    ),
                    inline=False
                )
                
                await ctx.send(embed=no_result_embed)
                return
            
            # Display results
            await self.display_results(ctx, formatted_cnic, results)
            
        except asyncio.TimeoutError:
            timeout_embed = discord.Embed(
                title="⏱️ Session Timeout",
                description=(
                    "```\n"
                    "╔═══════════════════════════════════════════════════════╗\n"
                    "║              REQUEST TIMEOUT                          ║\n"
                    "╠═══════════════════════════════════════════════════════╣\n"
                    "║                                                       ║\n"
                    "║   You took too long to respond!                       ║\n"
                    "║   Use !cnic to start a new lookup.                    ║\n"
                    "║                                                       ║\n"
                    "╚═══════════════════════════════════════════════════════╝\n"
                    "```"
                ),
                color=0xFF6B35
            )
            await ctx.send(embed=timeout_embed)
        
        except Exception as e:
            error_embed = discord.Embed(
                title="❌ Error Occurred",
                description=(
                    f"```\n"
                    f"An error occurred while processing your request:\n\n"
                    f"{str(e)}\n"
                    f"```"
                ),
                color=0xFF0000
            )
            await ctx.send(embed=error_embed)
    
    async def fetch_data_multiple_methods(self, cnic):
        """Try multiple methods to fetch data"""
        
        # Method 1: Direct POST request
        results = await self.method_post_request(cnic)
        if results:
            return results
        
        # Method 2: GET request with query parameters
        results = await self.method_get_request(cnic)
        if results:
            return results
        
        # Method 3: Alternative API endpoint (if exists)
        results = await self.method_alternative_api(cnic)
        if results:
            return results
        
        return None
    
    async def method_post_request(self, cnic):
        """Method 1: POST request to main endpoint"""
        try:
            session = await self.create_session()
            
            # First, get the page to establish session
            async with session.get(self.base_url) as response:
                await response.text()
            
            # Now POST the CNIC
            form_data = aiohttp.FormData()
            form_data.add_field('cnic', cnic)
            form_data.add_field('submit', 'Search')
            
            async with session.post(
                self.base_url,
                data=form_data,
                allow_redirects=True,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                
                if response.status == 200:
                    html = await response.text()
                    
                    # Debug: Print first 500 chars of HTML
                    print(f"HTML Response: {html[:500]}")
                    
                    return self.parse_html(html)
                else:
                    print(f"POST Request failed with status: {response.status}")
                    return None
                    
        except Exception as e:
            print(f"Method 1 error: {e}")
            return None
    
    async def method_get_request(self, cnic):
        """Method 2: GET request with query params"""
        try:
            session = await self.create_session()
            
            params = {
                'cnic': cnic,
                'search': '1'
            }
            
            url_with_params = f"{self.base_url}?{urlencode(params)}"
            
            async with session.get(url_with_params, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    html = await response.text()
                    return self.parse_html(html)
                return None
                
        except Exception as e:
            print(f"Method 2 error: {e}")
            return None
    
    async def method_alternative_api(self, cnic):
        """Method 3: Try alternative endpoints"""
        try:
            session = await self.create_session()
            
            # Try alternative URL patterns
            alternative_urls = [
                f"https://pakistandatabase.com/search.php?cnic={cnic}",
                f"https://pakistandatabase.com/api/search?cnic={cnic}",
                f"https://pakistandatabase.com/query.php?id={cnic}",
            ]
            
            for url in alternative_urls:
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status == 200:
                            html = await response.text()
                            results = self.parse_html(html)
                            if results:
                                return results
                except:
                    continue
            
            return None
            
        except Exception as e:
            print(f"Method 3 error: {e}")
            return None
    
    def parse_html(self, html):
        """Parse HTML and extract data - IMPROVED VERSION"""
        soup = BeautifulSoup(html, 'html.parser')
        results = []
        
        # Method 1: Look for tables with specific classes
        for table_class in ['table', 'table-bordered', 'table-striped', 'results', 'data-table']:
            tables = soup.find_all('table', class_=table_class)
            for table in tables:
                results.extend(self.extract_from_table(table))
        
        # Method 2: Look for tables without class
        if not results:
            tables = soup.find_all('table')
            for table in tables:
                results.extend(self.extract_from_table(table))
        
        # Method 3: Look for div-based results
        if not results:
            result_divs = soup.find_all('div', class_=['result', 'record', 'entry', 'data-row'])
            for div in result_divs:
                result = self.extract_from_div(div)
                if result:
                    results.append(result)
        
        # Method 4: Look for pre-formatted text
        if not results:
            pre_tags = soup.find_all('pre')
            for pre in pre_tags:
                result = self.extract_from_pre(pre)
                if result:
                    results.append(result)
        
        # Method 5: Generic text search for patterns
        if not results:
            text = soup.get_text()
            results = self.extract_from_text(text)
        
        return results if results else None
    
    def extract_from_table(self, table):
        """Extract data from HTML table"""
        results = []
        
        try:
            rows = table.find_all('tr')
            
            # Skip header row
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) >= 3:  # Minimum expected columns
                    result = {
                        'name': cells[0].get_text(strip=True) if len(cells) > 0 else 'N/A',
                        'cnic': cells[1].get_text(strip=True) if len(cells) > 1 else 'N/A',
                        'number': cells[2].get_text(strip=True) if len(cells) > 2 else 'N/A',
                        'address': cells[3].get_text(strip=True) if len(cells) > 3 else 'N/A',
                    }
                    
                    # Only add if it has meaningful data
                    if result['name'] != 'N/A' or result['number'] != 'N/A':
                        results.append(result)
        
        except Exception as e:
            print(f"Error extracting from table: {e}")
        
        return results
    
    def extract_from_div(self, div):
        """Extract data from div element"""
        try:
            text = div.get_text()
            
            # Look for patterns in text
            name_match = re.search(r'Name[:\s]+([^\n]+)', text, re.IGNORECASE)
            cnic_match = re.search(r'CNIC[:\s]+([0-9-]+)', text, re.IGNORECASE)
            number_match = re.search(r'(Mobile|Number|Phone)[:\s]+([0-9+\s-]+)', text, re.IGNORECASE)
            address_match = re.search(r'Address[:\s]+([^\n]+)', text, re.IGNORECASE)
            
            if any([name_match, cnic_match, number_match]):
                return {
                    'name': name_match.group(1).strip() if name_match else 'N/A',
                    'cnic': cnic_match.group(1).strip() if cnic_match else 'N/A',
                    'number': number_match.group(2).strip() if number_match else 'N/A',
                    'address': address_match.group(1).strip() if address_match else 'N/A',
                }
        
        except Exception as e:
            print(f"Error extracting from div: {e}")
        
        return None
    
    def extract_from_pre(self, pre):
        """Extract from pre-formatted text"""
        try:
            text = pre.get_text()
            lines = text.split('\n')
            
            result = {}
            for line in lines:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower()
                    value = value.strip()
                    
                    if 'name' in key:
                        result['name'] = value
                    elif 'cnic' in key:
                        result['cnic'] = value
                    elif any(x in key for x in ['mobile', 'number', 'phone']):
                        result['number'] = value
                    elif 'address' in key:
                        result['address'] = value
            
            if result:
                return result
        
        except Exception as e:
            print(f"Error extracting from pre: {e}")
        
        return None
    
    def extract_from_text(self, text):
        """Extract data from plain text using regex"""
        results = []
        
        try:
            # Look for mobile number patterns
            mobile_pattern = r'\+?92\s?3[0-9]{2}\s?[0-9]{7}|03[0-9]{2}\s?[0-9]{7}'
            mobiles = re.findall(mobile_pattern, text)
            
            # Look for CNIC patterns
            cnic_pattern = r'\d{5}-\d{7}-\d|\d{13}'
            cnics = re.findall(cnic_pattern, text)
            
            # Try to pair them up
            for i in range(min(len(cnics), len(mobiles))):
                results.append({
                    'name': 'Available on website',
                    'cnic': cnics[i],
                    'number': mobiles[i],
                    'address': 'Check website for details'
                })
        
        except Exception as e:
            print(f"Error extracting from text: {e}")
        
        return results
    
    async def display_results(self, ctx, cnic, results):
        """Display results in beautiful embeds"""
        
        # Success header
        success_embed = discord.Embed(
            title="✅ Records Found",
            description=(
                "```\n"
                "╔═══════════════════════════════════════════════════════╗\n"
                "║           DATABASE QUERY SUCCESSFUL                   ║\n"
                "╠═══════════════════════════════════════════════════════╣\n"
                f"║   CNIC         : {cnic}                    ║\n"
                f"║   Records      : {len(results)} found                              ║\n"
                "║   Status       : ✅ Complete                          ║\n"
                "║                                                       ║\n"
                "╚═══════════════════════════════════════════════════════╝\n"
                "```"
            ),
            color=0x00FF00,
            timestamp=discord.utils.utcnow()
        )
        
        success_embed.set_thumbnail(url="https://flagcdn.com/w320/pk.png")
        success_embed.set_footer(
            text=f"Requested by {ctx.author.name}",
            icon_url=ctx.author.display_avatar.url
        )
        
        await ctx.send(embed=success_embed)
        
        # Send results (max 10)
        for i, result in enumerate(results[:10], 1):
            result_embed = discord.Embed(
                title=f"📋 Record #{i}",
                color=0x00D9FF
            )
            
            result_embed.add_field(
                name="👤 Full Name",
                value=f"```{result.get('name', 'N/A')}```",
                inline=False
            )
            
            result_embed.add_field(
                name="🆔 CNIC Number",
                value=f"```{result.get('cnic', 'N/A')}```",
                inline=True
            )
            
            result_embed.add_field(
                name="📱 Mobile Number",
                value=f"```{result.get('number', 'N/A')}```",
                inline=True
            )
            
            result_embed.add_field(
                name="📍 Registered Address",
                value=f"```{result.get('address', 'N/A')[:200]}```",
                inline=False
            )
            
            result_embed.set_footer(
                text=f"Record {i} of {len(results)} • Pakistan Database",
                icon_url="https://flagcdn.com/w320/pk.png"
            )
            
            await ctx.send(embed=result_embed)
        
        if len(results) > 10:
            await ctx.send(
                f"```\n"
                f"ℹ️ Showing 10 of {len(results)} total records.\n"
                f"```"
            )
        
        # Disclaimer footer
        disclaimer_embed = discord.Embed(
            title="⚠️ Important Notice",
            description=(
                "```diff\n"
                "- This data is from public sources only\n"
                "+ Use this information responsibly\n"
                "+ Respect privacy laws and regulations\n"
                "- Misuse may result in legal consequences\n"
                "```\n\n"
                "**📊 Data Source:** Pakistan Database\n"
                "**🔗 Website:** https://pakistandatabase.com\n"
                f"**⏰ Retrieved:** {discord.utils.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}"
            ),
            color=0xFF6B35
        )
        
        await ctx.send(embed=disclaimer_embed)
    
    @commands.command(name='testparse')
    @commands.has_permissions(administrator=True)
    async def test_parse(self, ctx, cnic: str):
        """Test parsing for debugging (Admin only)"""
        
        await ctx.send("```\n🔄 Testing connection and parsing...\n```")
        
        results = await self.fetch_data_multiple_methods(cnic)
        
        if results:
            await ctx.send(f"```\n✅ Found {len(results)} results!\n```")
            for result in results[:3]:
                await ctx.send(f"```json\n{json.dumps(result, indent=2)}\n```")
        else:
            await ctx.send("```\n❌ No results found or parsing failed.\n```")


async def setup(bot):
    await bot.add_cog(CNICLookup(bot))