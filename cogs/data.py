import discord
from discord.ext import commands
import aiohttp
import asyncio
import re
import json
from bs4 import BeautifulSoup
from datetime import datetime


class CNICLookupRailway(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.base_url = "https://pakistandatabase.com/databases/sim.php"
        self.active_lookups = {}
    
    def validate_cnic(self, cnic_input):
        """Validate CNIC format"""
        clean_cnic = re.sub(r'[^0-9]', '', cnic_input)
        return clean_cnic if len(clean_cnic) == 13 else None
    
    @commands.command(name='cnic', aliases=['lookup', 'sim', 'search'])
    async def cnic_lookup(self, ctx):
        """CNIC/SIM Database Lookup - Railway Compatible"""
        
        if ctx.author.id in self.active_lookups:
            await ctx.send("```\n❌ You already have an active lookup!\n```")
            return
        
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
            timestamp=datetime.utcnow()
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
        
        prompt_embed.set_footer(text="ZeroDay Tool • Railway Hosted")
        prompt_embed.set_thumbnail(url="https://flagcdn.com/w320/pk.png")
        
        await ctx.send(embed=prompt_embed)
        
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel
        
        try:
            msg = await self.bot.wait_for('message', check=check, timeout=60.0)
            
            if msg.content.lower() == 'cancel':
                await ctx.send("```\n❌ Lookup cancelled.\n```")
                return
            
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
            
            formatted_cnic = f"{cnic[:5]}-{cnic[5:12]}-{cnic[12]}"
            
            # Mark as active
            self.active_lookups[ctx.author.id] = True
            
            # Show processing message
            processing_embed = discord.Embed(
                title="🔄 Processing Request",
                description=(
                    "```\n"
                    "┌───────────────────────────────────────────────────┐\n"
                    "│                                                   │\n"
                    f"│  CNIC     : {formatted_cnic}                      │\n"
                    "│  Status   : Generating lookup link...            │\n"
                    "│  Method   : Direct Website Access                │\n"
                    "│                                                   │\n"
                    "└───────────────────────────────────────────────────┘\n"
                    "```"
                ),
                color=0xFFA500
            )
            
            processing_msg = await ctx.send(embed=processing_embed)
            
            # Wait a moment for effect
            await asyncio.sleep(2)
            
            await processing_msg.delete()
            
            # Generate lookup result
            await self.generate_lookup_result(ctx, cnic, formatted_cnic)
            
            # Remove from active lookups
            del self.active_lookups[ctx.author.id]
            
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
                description=f"```\n{str(e)}\n```",
                color=0xFF0000
            )
            await ctx.send(embed=error_embed)
            
        finally:
            if ctx.author.id in self.active_lookups:
                del self.active_lookups[ctx.author.id]
    
    async def generate_lookup_result(self, ctx, cnic, formatted_cnic):
        """Generate lookup result with direct website link"""
        
        result_embed = discord.Embed(
            title="🔗 CNIC Lookup Generated",
            description=(
                "```\n"
                "╔═══════════════════════════════════════════════════════╗\n"
                "║           LOOKUP LINK GENERATED                       ║\n"
                "╠═══════════════════════════════════════════════════════╣\n"
                f"║   CNIC: {formatted_cnic}                    ║\n"
                "║   Status: Ready for manual search                     ║\n"
                "╚═══════════════════════════════════════════════════════╝\n"
                "```"
            ),
            color=0x5865F2,
            timestamp=datetime.utcnow()
        )
        
        result_embed.add_field(
            name="🌐 Search Methods",
            value=(
                f"**Method 1: Direct Link**\n"
                f"[🔗 Click Here to Open Database]({self.base_url})\n\n"
                f"**Method 2: Alternative Search**\n"
                f"[🔗 CNIC.pk Search](https://cnic.pk)\n\n"
                f"**Method 3: Manual Entry**\n"
                f"Visit: `pakistandatabase.com`\n"
                f"Enter CNIC: `{cnic}`"
            ),
            inline=False
        )
        
        result_embed.add_field(
            name="📋 Step-by-Step Guide",
            value=(
                "```yaml\n"
                "Step 1: Click the blue link above\n"
                "Step 2: Website will open in browser\n"
                f"Step 3: Enter CNIC: {cnic}\n"
                "Step 4: Click 'Search' or 'Submit'\n"
                "Step 5: View results on website\n"
                "```"
            ),
            inline=False
        )
        
        result_embed.add_field(
            name="📱 CNIC Details",
            value=(
                f"```\n"
                f"Full CNIC  : {formatted_cnic}\n"
                f"Digits     : {cnic}\n"
                f"Province   : {self.get_province(cnic[:5])}\n"
                f"Gender     : {self.get_gender(cnic[12])}\n"
                f"```"
            ),
            inline=False
        )
        
        result_embed.add_field(
            name="⚠️ Why Manual Lookup?",
            value=(
                "```diff\n"
                "- Website uses anti-bot protection\n"
                "- CAPTCHA verification required\n"
                "- JavaScript-based rendering\n"
                "+ Direct link provides instant access\n"
                "+ More reliable than automation\n"
                "```"
            ),
            inline=False
        )
        
        result_embed.add_field(
            name="💡 Pro Tips",
            value=(
                "• Use incognito/private mode\n"
                "• Clear browser cache if issues\n"
                "• Try different browsers\n"
                "• Check website is accessible"
            ),
            inline=False
        )
        
        result_embed.set_thumbnail(url="https://flagcdn.com/w320/pk.png")
        result_embed.set_footer(
            text=f"Requested by {ctx.author.name} • Railway Hosted Bot",
            icon_url=ctx.author.display_avatar.url
        )
        
        # Create button view
        view = LookupButtonView(self.base_url, cnic)
        
        await ctx.send(embed=result_embed, view=view)
        
        # Send additional info
        info_embed = discord.Embed(
            title="📊 Additional Information",
            description=(
                "**🔒 Privacy & Security:**\n"
                "• Data from public sources only\n"
                "• No data stored by this bot\n"
                "• Respect privacy laws\n\n"
                "**⚖️ Legal Notice:**\n"
                "• Use for legitimate purposes only\n"
                "• Educational purposes only\n"
                "• Misuse may result in legal action\n\n"
                "**📞 Support:**\n"
                "• Use `!ticket` for help\n"
                "• Report issues to staff\n"
            ),
            color=0xFF6B35
        )
        
        await ctx.send(embed=info_embed)
    
    def get_province(self, code):
        """Get province from CNIC code"""
        provinces = {
            '1': 'Islamabad',
            '2': 'Punjab',
            '3': 'Sindh',
            '4': 'KPK',
            '5': 'Balochistan',
            '6': 'FATA',
            '7': 'Gilgit-Baltistan'
        }
        return provinces.get(code[0], 'Unknown')
    
    def get_gender(self, digit):
        """Get gender from last digit"""
        return 'Male' if int(digit) % 2 != 0 else 'Female'
    
    @commands.command(name='cnicinfo')
    async def cnic_info(self, ctx, cnic: str):
        """Get basic CNIC information without lookup"""
        
        clean_cnic = self.validate_cnic(cnic)
        
        if not clean_cnic:
            await ctx.send("```\n❌ Invalid CNIC format!\n```")
            return
        
        formatted = f"{clean_cnic[:5]}-{clean_cnic[5:12]}-{clean_cnic[12]}"
        
        info_embed = discord.Embed(
            title="🆔 CNIC Information",
            description=f"**CNIC:** `{formatted}`",
            color=0x00D9FF
        )
        
        info_embed.add_field(
            name="📍 Province",
            value=f"`{self.get_province(clean_cnic[:5])}`",
            inline=True
        )
        
        info_embed.add_field(
            name="👤 Gender",
            value=f"`{self.get_gender(clean_cnic[12])}`",
            inline=True
        )
        
        info_embed.add_field(
            name="🆔 Sequence",
            value=f"`{clean_cnic[5:12]}`",
            inline=True
        )
        
        info_embed.add_field(
            name="📊 Full Breakdown",
            value=(
                f"```\n"
                f"Province Code : {clean_cnic[:5]}\n"
                f"Sequence Code : {clean_cnic[5:12]}\n"
                f"Gender Digit  : {clean_cnic[12]}\n"
                f"```"
            ),
            inline=False
        )
        
        info_embed.set_footer(text="Use !cnic for full database lookup")
        
        await ctx.send(embed=info_embed)
    
    @commands.command(name='cancellookup')
    async def cancel_lookup(self, ctx):
        """Cancel active lookup session"""
        
        if ctx.author.id in self.active_lookups:
            del self.active_lookups[ctx.author.id]
            await ctx.send("```\n✅ Lookup session cancelled.\n```")
        else:
            await ctx.send("```\n❌ No active lookup session.\n```")


class LookupButtonView(discord.ui.View):
    def __init__(self, url, cnic):
        super().__init__(timeout=300)  # 5 minute timeout
        self.url = url
        self.cnic = cnic
        
        # Add URL button
        self.add_item(discord.ui.Button(
            label="🔗 Open Database Website",
            url=self.url,
            style=discord.ButtonStyle.link
        ))
        
        # Add alternative URL
        self.add_item(discord.ui.Button(
            label="🔗 Alternative Search",
            url="https://cnic.pk",
            style=discord.ButtonStyle.link
        ))
    
    @discord.ui.button(label="📋 Copy CNIC", style=discord.ButtonStyle.primary)
    async def copy_cnic(self, interaction: discord.Interaction, button: discord.ui.Button):
        """Send CNIC in copyable format"""
        await interaction.response.send_message(
            f"**Copy this CNIC:**\n```\n{self.cnic}\n```",
            ephemeral=True
        )
    
    @discord.ui.button(label="ℹ️ Help", style=discord.ButtonStyle.secondary)
    async def help_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        """Show help message"""
        help_embed = discord.Embed(
            title="📚 How to Use",
            description=(
                "**Steps:**\n"
                "1. Click 'Open Database Website' button\n"
                "2. Website opens in new tab\n"
                f"3. Enter CNIC: `{self.cnic}`\n"
                "4. Click Search/Submit\n"
                "5. View results\n\n"
                "**Tip:** Click 'Copy CNIC' to copy easily!"
            ),
            color=0x5865F2
        )
        await interaction.response.send_message(embed=help_embed, ephemeral=True)


async def setup(bot):
    await bot.add_cog(CNICLookupRailway(bot))