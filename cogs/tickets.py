import asyncio
import discord
from discord.ext import commands
from utils.database import db
from utils.embeds import embeds
import json

class Tickets(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    def load_config(self):
        with open('config.json', 'r') as f:
            return json.load(f)
    
    @commands.command(name='ticket')
    async def create_ticket(self, ctx, *, reason: str = "Support Request"):
        """Create a support ticket"""
        
        config = self.load_config()
        category_id = config.get('ticket_category')
        
        if not category_id:
            await ctx.send("❌ Ticket system not configured! Please contact an administrator.")
            return
        
        category = ctx.guild.get_channel(category_id)
        
        if not category:
            await ctx.send("❌ Ticket category not found!")
            return
        
        # Check if user already has an open ticket
        user_tickets = db.get_user_tickets(ctx.author.id)
        open_tickets = [t for t in user_tickets if t['status'] == 'open']
        
        if open_tickets:
            await ctx.send("❌ You already have an open ticket! Please close it before creating a new one.")
            return
        
        # Create ticket in database
        ticket_data = {
            'user_id': ctx.author.id,
            'type': 'support',
            'description': reason
        }
        
        ticket = db.create_ticket(ticket_data)
        
        # Create ticket channel
        overwrites = {
            ctx.guild.default_role: discord.PermissionOverwrite(read_messages=False),
            ctx.author: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            ctx.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True, manage_channels=True)
        }
        
        # Add support role permissions
        for role_id in config.get('support_roles', []):
            role = ctx.guild.get_role(role_id)
            if role:
                overwrites[role] = discord.PermissionOverwrite(read_messages=True, send_messages=True)
        
        channel = await ctx.guild.create_text_channel(
            name=f"ticket-{ticket['ticket_id']}",
            category=category,
            overwrites=overwrites
        )
        
        # Update ticket with channel ID
        db.update_ticket(ticket['ticket_id'], {'channel_id': channel.id})
        
        # Send welcome message
        welcome_embed = discord.Embed(
            title=f"🎫 Support Ticket - {ticket['ticket_id']}",
            description=f"Hello {ctx.author.mention}! Support will be with you shortly.",
            color=0x00ff9d
        )
        
        welcome_embed.add_field(name="📝 Reason", value=reason, inline=False)
        welcome_embed.add_field(
            name="ℹ️ Information",
            value="• Please describe your issue in detail\n• A staff member will respond soon\n• Use `!closeticket` to close this ticket",
            inline=False
        )
        
        welcome_embed.set_footer(text=f"Ticket created by {ctx.author}")
        
        msg = await channel.send(ctx.author.mention, embed=welcome_embed)
        await msg.pin()
        
        await ctx.send(f"✅ Ticket created! {channel.mention}")
        
        # Log ticket creation
        await self.log_ticket_action(ctx.guild, "Ticket Created", ticket, ctx.author)
    
    @commands.command(name='closeticket')
    async def close_ticket(self, ctx):
        """Close a ticket"""
        
        # Check if command is used in a ticket channel
        if not ctx.channel.name.startswith('ticket-') and not ctx.channel.name.startswith('order-'):
            await ctx.send("❌ This command can only be used in ticket channels!")
            return
        
        # Extract ticket ID from channel name
        channel_parts = ctx.channel.name.split('-')
        if len(channel_parts) < 3:
            await ctx.send("❌ Invalid ticket channel format!")
            return

        ticket_id = "-".join(channel_parts[1:])
        ticket = db.get_ticket(ticket_id)
        
        if not ticket:
            await ctx.send("❌ Ticket not found in database!")
            return
        
        # Confirm closure
        confirm_embed = discord.Embed(
            title="🔒 Close Ticket?",
            description="React with ✅ to confirm ticket closure\nThis action cannot be undone!",
            color=0xff0000
        )
        
        msg = await ctx.send(embed=confirm_embed)
        await msg.add_reaction('✅')
        await msg.add_reaction('❌')
        
        def check(reaction, user):
            return user == ctx.author and str(reaction.emoji) in ['✅', '❌'] and reaction.message.id == msg.id
        
        try:
            reaction, user = await self.bot.wait_for('reaction_add', timeout=30.0, check=check)
            
            if str(reaction.emoji) == '✅':
                # Update ticket status
                db.update_ticket(ticket['ticket_id'], {'status': 'closed', 'closed_by': ctx.author.id})
                
                # Create transcript
                transcript = await self.create_transcript(ctx.channel)
                
                # Send transcript to user
                try:
                    transcript_embed = discord.Embed(
                        title=f"📄 Ticket Transcript - {ticket['ticket_id']}",
                        description="Your ticket has been closed. Here's a transcript of the conversation.",
                        color=0x00ff9d
                    )
                    
                    user = self.bot.get_user(ticket['user_id'])
                    await user.send(embed=transcript_embed, file=discord.File(transcript, f"{ticket['ticket_id']}-transcript.txt"))
                except:
                    pass
                
                # Log closure
                await self.log_ticket_action(ctx.guild, "Ticket Closed", ticket, ctx.author)
                
                # Delete channel
                await ctx.send("🔒 Ticket closing in 5 seconds...")
                await asyncio.sleep(5)
                await ctx.channel.delete()
                
            else:
                await ctx.send("❌ Ticket closure cancelled.")
                
        except asyncio.TimeoutError:
            await ctx.send("⏱️ Confirmation timeout. Ticket closure cancelled.")
    
    @commands.command(name='adduser')
    @commands.has_permissions(manage_channels=True)
    async def add_user_to_ticket(self, ctx, user: discord.Member):
        """Add user to ticket"""
        
        if not ctx.channel.name.startswith('ticket-'):
            await ctx.send("❌ This command can only be used in ticket channels!")
            return
        
        await ctx.channel.set_permissions(user, read_messages=True, send_messages=True)
        await ctx.send(f"✅ Added {user.mention} to the ticket.")
    
    @commands.command(name='removeuser')
    @commands.has_permissions(manage_channels=True)
    async def remove_user_from_ticket(self, ctx, user: discord.Member):
        """Remove user from ticket"""
        
        if not ctx.channel.name.startswith('ticket-'):
            await ctx.send("❌ This command can only be used in ticket channels!")
            return
        
        await ctx.channel.set_permissions(user, overwrite=None)
        await ctx.send(f"✅ Removed {user.mention} from the ticket.")
    
    @commands.command(name='mytickets')
    async def my_tickets(self, ctx):
        """View your tickets"""
        
        tickets = db.get_user_tickets(ctx.author.id)
        
        if not tickets:
            await ctx.send("📭 You have no tickets!")
            return
        
        embed = discord.Embed(
            title="🎫 Your Tickets",
            description=f"Total Tickets: {len(tickets)}",
            color=0x00ff9d
        )
        
        for ticket in tickets[:10]:
            status_emoji = {
                'open': '🟢',
                'pending': '🟡',
                'closed': '🔴'
            }.get(ticket['status'], '⚪')
            
            embed.add_field(
                name=f"{status_emoji} {ticket['ticket_id']}",
                value=f"Type: {ticket['type']}\nStatus: {ticket['status']}\nCreated: {ticket['created_at'][:10]}",
                inline=True
            )
        
        await ctx.send(embed=embed)
    
    async def create_transcript(self, channel):
        """Create ticket transcript"""
        import io
        
        messages = []
        async for message in channel.history(limit=None, oldest_first=True):
            timestamp = message.created_at.strftime("%Y-%m-%d %H:%M:%S")
            messages.append(f"[{timestamp}] {message.author}: {message.content}")
        
        transcript = "\n".join(messages)
        
        file_obj = io.BytesIO(transcript.encode())
        file_obj.seek(0)
        
        return file_obj
    
    async def log_ticket_action(self, guild, action, ticket, user):
        """Log ticket actions"""
        config = self.load_config()
        log_channel_id = config.get('log_channel')
        
        if not log_channel_id:
            return
        
        log_channel = guild.get_channel(log_channel_id)
        
        if not log_channel:
            return
        
        embed = discord.Embed(
            title=f"📋 {action}",
            color=0x00ff9d,
            timestamp=discord.utils.utcnow()
        )
        
        embed.add_field(name="Ticket ID", value=ticket['ticket_id'], inline=True)
        embed.add_field(name="User", value=user.mention, inline=True)
        embed.add_field(name="Type", value=ticket.get('type', 'Unknown'), inline=True)
        
        embed.set_footer(text=f"Action by {user}", icon_url=user.display_avatar.url)
        
        await log_channel.send(embed=embed)

async def setup(bot):
    await bot.add_cog(Tickets(bot))
