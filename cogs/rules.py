import discord
from discord.ext import commands
from datetime import datetime

BANNER_PATH = "database/banner.jpg"
BANNER_ATTACHMENT = "attachment://banner.jpg"
AUTO_JOIN_ROLE_ID = 1490998019603042496

class RulesSystem(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.rules_channel_id = 1489318727605551265
        self.rules_message_id = None
    
    @commands.command(name='postrules')
    @commands.has_permissions(administrator=True)
    async def post_rules(self, ctx):
        """Post beautiful rules embed to the specified channel"""
        
        channel = self.bot.get_channel(self.rules_channel_id)
        
        if not channel:
            await ctx.send("❌ Rules channel not found!")
            return
        
        # Clear previous messages in rules channel
        try:
            await channel.purge(limit=100)
        except:
            pass
        
        # ============ HEADER EMBED ============
        header_embed = discord.Embed(
            title="",
            description="",
            color=0x0A0E27
        )
        
        header_embed.set_image(url=BANNER_ATTACHMENT)
        
        header_embed.description = (
            "```ansi\n"
            "\u001b[1;36m╔═══════════════════════════════════════════════════════╗\n"
            "\u001b[1;36m║                                                       ║\n"
            "\u001b[1;36m║     🏛️  ZERODAY TOOLS MARKETPLACE RULES  🏛️          ║\n"
            "\u001b[1;36m║                                                       ║\n"
            "\u001b[1;36m╚═══════════════════════════════════════════════════════╝\n"
            "```\n"
            "**Welcome to ZeroDay Tools Marketplace**\n"
            "Please read all rules carefully before participating.\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        )
        
        await channel.send(embed=header_embed, file=discord.File(BANNER_PATH, filename="banner.jpg"))
        
        # ============ GENERAL CONDUCT EMBED ============
        conduct_embed = discord.Embed(
            title="",
            color=0x5865F2,
            timestamp=datetime.utcnow()
        )
        
        conduct_embed.set_author(
            name="📋 GENERAL CONDUCT",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        conduct_embed.add_field(
            name="✅ **DO:**",
            value=(
                "```diff\n"
                "+ Treat all members with respect\n"
                "+ Use appropriate language\n"
                "+ Follow staff instructions\n"
                "+ Ask questions in correct channels\n"
                "+ Use search before asking\n"
                "```"
            ),
            inline=True
        )
        
        conduct_embed.add_field(
            name="❌ **DON'T:**",
            value=(
                "```diff\n"
                "- Harass, bully, or discriminate\n"
                "- Spam or flood channels\n"
                "- Advertise without permission\n"
                "- Share personal information\n"
                "- Engage in drama or arguments\n"
                "```"
            ),
            inline=True
        )
        
        conduct_embed.set_footer(text="ZeroDay Tools • Section 1/7")
        
        await channel.send(embed=conduct_embed)
        
        # ============ MARKETPLACE GUIDELINES EMBED ============
        marketplace_embed = discord.Embed(
            title="",
            color=0x00D9FF,
            timestamp=datetime.utcnow()
        )
        
        marketplace_embed.set_author(
            name="💰 MARKETPLACE GUIDELINES",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        marketplace_embed.add_field(
            name="🎫 **PURCHASING PROCESS**",
            value=(
                "```yaml\n"
                "Step 1: Browse catalog in sales channel\n"
                "Step 2: Create ticket with !ticket command\n"
                "Step 3: Provide required documents\n"
                "Step 4: Receive custom quote from staff\n"
                "Step 5: Complete secure payment\n"
                "Step 6: Receive product instantly\n"
                "```"
            ),
            inline=False
        )
        
        marketplace_embed.add_field(
            name="💳 **ACCEPTED PAYMENTS**",
            value=(
                "> 🟢 **Cryptocurrency** (PREFERRED)\n"
                "> • Bitcoin (BTC)\n"
                "> • Ethereum (ETH)\n"
                "> • Tether (USDT)\n"
                "> \n"
                "> 🔵 **PayPal** (Business accounts only)\n"
                "> 🟡 **Wire Transfer** (Enterprise clients)\n"
                "> 🟣 **Credit/Debit Cards** (Select sellers)"
            ),
            inline=True
        )
        
        marketplace_embed.add_field(
            name="🔄 **REFUND POLICY**",
            value=(
                "```fix\n"
                "✅ ACCEPTED:\n"
                "• Defective product\n"
                "• Non-delivery\n"
                "• Product not as described\n"
                "\n"
                "❌ REJECTED:\n"
                "• Buyer's remorse\n"
                "• User error\n"
                "• Change of mind\n"
                "\n"
                "⏰ Request within: 48 hours\n"
                "📧 Process: Open ticket with proof\n"
                "```"
            ),
            inline=True
        )
        
        marketplace_embed.set_footer(text="ZeroDay Tools • Section 2/7")
        
        await channel.send(embed=marketplace_embed)
        
        # ============ LEGAL COMPLIANCE EMBED ============
        legal_embed = discord.Embed(
            title="",
            color=0xFF0000,
            timestamp=datetime.utcnow()
        )
        
        legal_embed.set_author(
            name="🛡️ CYBERSECURITY LEGAL COMPLIANCE",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        legal_embed.description = (
            "```ansi\n"
            "\u001b[1;31m⚠️  CRITICAL LEGAL NOTICE  ⚠️\n"
            "\u001b[1;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "\u001b[1;31mUnauthorized use of security tools is illegal\n"
            "\u001b[1;31mand punishable by law enforcement agencies\n"
            "```"
        )
        
        legal_embed.add_field(
            name="⚖️ **CONSEQUENCES OF MISUSE**",
            value=(
                "```diff\n"
                "- WE WILL TAKE THE FOLLOWING ACTIONS:\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "! Terminate your account immediately\n"
                "! Revoke all licenses permanently\n"
                "! Provide evidence for prosecution\n"
                "! No refunds will be issued\n"
                "! Report to law enforcement if necessary\n"
                "```"
            ),
            inline=False
        )
        
        legal_embed.add_field(
            name="📜 **BUYER RESPONSIBILITIES**",
            value=(
                "> You are **solely responsible** for:\n"
                "> • Obtaining proper authorization\n"
                "> • Complying with local laws\n"
                "> • Using tools ethically\n"
                "> • Providing required documentation\n"
                "> • Understanding legal implications"
            ),
            inline=False
        )
        
        legal_embed.set_footer(text="ZeroDay Tools • Section 3/7")
        
        await channel.send(embed=legal_embed)
        
        # ============ PROHIBITED ACTIVITIES EMBED ============
        prohibited_embed = discord.Embed(
            title="",
            color=0x8B0000,
            timestamp=datetime.utcnow()
        )
        
        prohibited_embed.set_author(
            name="🚫 PROHIBITED ACTIVITIES",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        prohibited_embed.description = (
            "```ansi\n"
            "\u001b[1;31m💀 THE FOLLOWING ACTIONS RESULT IN INSTANT PERMANENT BAN\n"
            "```"
        )
        
        prohibited_activities = [
            ("❌ Sharing/Reselling Products", "→ License revocation + Permanent ban"),
            ("❌ Illegal Use of Tools", "→ Ban + Strict legal action"),
            ("❌ Scamming/Fraud", "→ Ban + Strict legal action"),
            ("❌ Chargebacks", "→ Ban + No refund + Blacklist"),
            ("❌ Account Sharing/Alts", "→ All accounts permanently banned"),
            ("❌ Doxxing/Threats", "→ Ban + Legal consequences"),
            ("❌ NSFW Content", "→ Immediate permanent ban"),
            ("❌ Impersonating Staff", "→ Permanent ban + Report"),
        ]
        
        for i in range(0, len(prohibited_activities), 2):
            field1 = prohibited_activities[i]
            field2 = prohibited_activities[i+1] if i+1 < len(prohibited_activities) else ("", "")
            
            prohibited_embed.add_field(
                name=field1[0],
                value=f"`{field1[1]}`",
                inline=True
            )
            if field2[0]:
                prohibited_embed.add_field(
                    name=field2[0],
                    value=f"`{field2[1]}`",
                    inline=True
                )
            prohibited_embed.add_field(name="", value="", inline=False)  # Spacer
        
        prohibited_embed.set_footer(text="ZeroDay Tools • Section 4/7")
        
        await channel.send(embed=prohibited_embed)
        
        # ============ SUPPORT SYSTEM EMBED ============
        support_embed = discord.Embed(
            title="",
            color=0x5865F2,
            timestamp=datetime.utcnow()
        )
        
        support_embed.set_author(
            name="🎫 SUPPORT SYSTEM",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        support_embed.add_field(
            name="✅ **PROPER TICKET USE**",
            value=(
                "```css\n"
                "[Best Practices]\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "• One ticket per issue\n"
                "• Clear, detailed description\n"
                "• Include relevant screenshots\n"
                "• Be patient (response <24h)\n"
                "• Follow staff instructions\n"
                "```"
            ),
            inline=True
        )
        
        support_embed.add_field(
            name="❌ **TICKET ABUSE**",
            value=(
                "```diff\n"
                "[Prohibited]\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "- No spam tickets\n"
                "- No joke/troll tickets\n"
                "- No demanding immediate response\n"
                "- No opening multiple tickets\n"
                "- No harassing staff in DMs\n"
                "```"
            ),
            inline=True
        )
        
        support_embed.add_field(
            name="🕐 **SUPPORT HOURS**",
            value=(
                "> 🟢 **Ticket System:** Available 24/7\n"
                "> 🟡 **Staff Response:** Within 24 hours\n"
                "> 🔴 **Urgent Issues:** Flagged priority\n"
                "> 🟣 **Weekends:** Slower response time"
            ),
            inline=False
        )
        
        support_embed.set_footer(text="ZeroDay Tools • Section 5/7")
        
        await channel.send(embed=support_embed)
        
        # ============ ENFORCEMENT EMBED ============
        enforcement_embed = discord.Embed(
            title="",
            color=0xFF6B35,
            timestamp=datetime.utcnow()
        )
        
        enforcement_embed.set_author(
            name="🔨 ENFORCEMENT & PUNISHMENTS",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        enforcement_embed.add_field(
            name="⚖️ **PROGRESSIVE DISCIPLINE**",
            value=(
                "```yaml\n"
                "Minor Violations:\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "1st Offense: ⚠️ Verbal Warning\n"
                "2nd Offense: ⚠️ Written Warning + 24h Mute\n"
                "3rd Offense: 🔇 7-Day Temporary Ban\n"
                "4th Offense: 🔨 Permanent Ban\n"
                "```"
            ),
            inline=False
        )
        
        enforcement_embed.add_field(
            name="💀 **MAJOR VIOLATIONS**",
            value=(
                "```diff\n"
                "- Immediate Permanent Ban (No warnings)\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "! Scamming\n"
                "! Illegal Activity\n"
                "! Sharing Products\n"
                "! Doxxing/Threats\n"
                "! Harassment\n"
                "```"
            ),
            inline=True
        )
        
        enforcement_embed.add_field(
            name="📧 **APPEAL PROCESS**",
            value=(
                "```fix\n"
                "Appeal Guidelines:\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "• Email appeals only (no DMs)\n"
                "• Include: Username, Reason, Evidence\n"
                "• Response: 3-7 business days\n"
                "• Acceptance rate: <5%\n"
                "• Major violations: No appeals\n"
                "```"
            ),
            inline=True
        )
        
        enforcement_embed.set_footer(text="ZeroDay Tools • Section 6/7")
        
        await channel.send(embed=enforcement_embed)
        
        # ============ PRIVACY & DISCLAIMERS EMBED ============
        privacy_embed = discord.Embed(
            title="",
            color=0x00C853,
            timestamp=datetime.utcnow()
        )
        
        privacy_embed.set_author(
            name="🔐 PRIVACY & DATA PROTECTION",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        privacy_embed.add_field(
            name="📊 **DATA WE COLLECT**",
            value=(
                "> • Discord ID & Username\n"
                "> • Purchase history\n"
                "> • Ticket conversations\n"
                "> • Payment confirmations (not card details)\n"
                "> • IP addresses (for security)"
            ),
            inline=True
        )
        
        privacy_embed.add_field(
            name="🔒 **DATA PROTECTION**",
            value=(
                "> • Encrypted storage\n"
                "> • NOT shared with third parties\n"
                "> • Used for orders only\n"
                "> • GDPR/CCPA compliant\n"
                "> • Deletion requests honored"
            ),
            inline=True
        )
        
        privacy_embed.add_field(
            name="⚠️ **LEGAL DISCLAIMERS**",
            value=(
                "```diff\n"
                "+ All products sold 'AS IS'\n"
                "+ No warranty unless explicitly stated\n"
                "+ Buyer assumes all risks\n"
                "+ We are not liable for misuse\n"
                "- Trading: Past performance ≠ future results\n"
                "- Cybersecurity: Authorization required\n"
                "! Refunds at our discretion\n"
                "! Rules may change without notice\n"
                "! Staff decisions are final\n"
                "```"
            ),
            inline=False
        )
        
        privacy_embed.set_footer(text="ZeroDay Tools • Section 7/7")
        
        await channel.send(embed=privacy_embed)
        
        # ============ ACCEPTANCE EMBED ============
        acceptance_embed = discord.Embed(
            title="",
            color=0x00FF9D,
            timestamp=datetime.utcnow()
        )
        
        acceptance_embed.description = (
            "```ansi\n"
            "\u001b[1;32m╔═══════════════════════════════════════════════════════╗\n"
            "\u001b[1;32m║                                                       ║\n"
            "\u001b[1;32m║            ✅ ACCEPTANCE REQUIRED ✅                   ║\n"
            "\u001b[1;32m║                                                       ║\n"
            "\u001b[1;32m╚═══════════════════════════════════════════════════════╝\n"
            "```\n"
            "**By reacting with ✅ below, you confirm that you have:**\n\n"
            "☑️ Read and understood **all rules**\n"
            "☑️ Agree to comply with **all policies**\n"
            "☑️ Accept **consequences** for violations\n"
            "☑️ Understand **legal requirements**\n"
            "☑️ Will use products **legally and ethically**\n"
            "\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        )
        
        acceptance_embed.add_field(
            name="",
            value=(
                "```yaml\n"
                "Contact Staff: Use !ticket command\n"
                "Last Updated: January 2025\n"
                "Version: 1.0\n"
                "```"
            ),
            inline=False
        )
        
        acceptance_embed.add_field(
            name="📞 **NEED HELP?**",
            value=(
                "> **Support:** Use `!ticket`\n"
                "> **Commands:** Use `!help`\n"
                "> **Sales:** Visit sales channel\n"
                "> **Questions:** Ask in support"
            ),
            inline=True
        )
        
        acceptance_embed.add_field(
            name="🎯 **QUICK LINKS**",
            value=(
                "> 📢 **Tools :** <#1490989769717715055>\n"
                "> 📚 **Announcements:** <#1489318723704590396>\n"
                "> 💬 **Chat:** <#1490993327842267289>\n"
                
            ),
            inline=True
        )
        
        acceptance_embed.set_footer(
            text="React with ✅ to accept rules and gain full server access",
            icon_url="https://cdn.discordapp.com/emojis/1234567890.png"
        )
        
        acceptance_embed.set_thumbnail(url=BANNER_ATTACHMENT)
        
        msg = await channel.send(embed=acceptance_embed, file=discord.File(BANNER_PATH, filename="banner.jpg"))
        await msg.add_reaction("✅")
        
        # Store message ID for reaction tracking
        self.rules_message_id = msg.id
        
        # Save to config
        try:
            config = self.load_config()
            config['rules_message_id'] = msg.id
            self.save_config(config)
        except:
            pass
        
        # Confirmation message
        await ctx.send(f"✅ **Rules posted successfully to** <#{self.rules_channel_id}>", delete_after=10)
        try:
            await ctx.message.delete()
        except (discord.NotFound, discord.Forbidden):
            pass
    
    def load_config(self):
        import json
        try:
            with open('config.json', 'r') as f:
                return json.load(f)
        except:
            return {}
    
    def save_config(self, config):
        import json
        with open('config.json', 'w') as f:
            json.dump(config, f, indent=4)
    
    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload):
        """Handle rules acceptance"""
        
        # Ignore bot reactions
        if payload.user_id == self.bot.user.id:
            return
        
        # Check if it's the rules message
        if payload.message_id != self.rules_message_id:
            return
        
        # Check if it's the checkmark emoji
        if str(payload.emoji) != "✅":
            return
        
        guild = self.bot.get_guild(payload.guild_id)
        member = guild.get_member(payload.user_id)
        
        # Find or create verified role
        verified_role = discord.utils.get(guild.roles, name="Verified Member")
        
        if not verified_role:
            verified_role = await guild.create_role(
                name="Verified Member",
                color=discord.Color.green(),
                reason="Auto-created for rules acceptance"
            )
        
        # Add role to member
        if verified_role not in member.roles:
            await member.add_roles(verified_role)
            
            # Send welcome DM
            try:
                welcome_embed = discord.Embed(
                    title="✅ Welcome to ZeroDay Tools Marketplace!",
                    description=(
                        "**Thank you for accepting our rules!**\n\n"
                        "You now have full access to:\n"
                        "• 🛡️ Browse cybersecurity tools\n"
                        "• 📈 View trading indicators\n"
                        "• 🤖 Check MT5 bots\n"
                        "• 🎫 Create support tickets\n"
                        "• 💬 Community channels\n\n"
                        "**Quick Start:**\n"
                        "1. Visit the sales channel\n"
                        "2. Browse 180+ premium products\n"
                        "3. Use `!ticket` for pricing\n"
                        "4. Complete your purchase\n\n"
                        "**Need help?** Use `!help` anytime!"
                    ),
                    color=0x00FF9D,
                    timestamp=datetime.utcnow()
                )
                welcome_embed.set_footer(text="Happy shopping! 🛒")
                welcome_embed.set_thumbnail(url=BANNER_ATTACHMENT)
                
                await member.send(embed=welcome_embed, file=discord.File(BANNER_PATH, filename="banner.jpg"))
            except:
                pass  # DMs disabled

    @commands.Cog.listener()
    async def on_member_join(self, member):
        """Automatically assign the default join role to new members."""
        role = member.guild.get_role(AUTO_JOIN_ROLE_ID)

        if role is None:
            return

        try:
            await member.add_roles(role, reason="Automatic role assignment on member join")
        except discord.Forbidden:
            pass
        except discord.HTTPException:
            pass


async def setup(bot):
    await bot.add_cog(RulesSystem(bot))
