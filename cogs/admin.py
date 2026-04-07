import discord
from discord.ext import commands
from utils.database import db
from utils.embeds import embeds
import os
import platform

OWNER_ID = 1170979888019292261

class Admin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command(name='setstatus')
    @commands.has_permissions(administrator=True)
    async def set_order_status(self, ctx, order_id: str, status: str):
        """Update order status"""
        
        valid_statuses = ['pending', 'processing', 'completed', 'cancelled']
        
        if status.lower() not in valid_statuses:
            await ctx.send(f"❌ Invalid status! Valid options: {', '.join(valid_statuses)}")
            return
        
        order = db.get_order(order_id)
        
        if not order:
            await ctx.send("❌ Order not found!")
            return
        
        db.update_order(order_id, {'status': status.lower()})
        
        # Notify user
        user = self.bot.get_user(order['user_id'])
        product = db.get_product_by_id(order['product_id'])
        
        if user:
            status_colors = {
                'pending': 0xffa500,
                'processing': 0x00a8ff,
                'completed': 0x00ff00,
                'cancelled': 0xff0000
            }
            
            notify_embed = discord.Embed(
                title=f"📦 Order Status Updated",
                description=f"Your order **{order_id}** status has been updated",
                color=status_colors.get(status.lower(), 0x00ff9d)
            )
            
            notify_embed.add_field(name="Product", value=product['name'], inline=True)
            notify_embed.add_field(name="New Status", value=status.upper(), inline=True)
            
            if status.lower() == 'completed':
                notify_embed.add_field(
                    name="✅ Order Completed",
                    value="Thank you for your purchase! Your product has been delivered.",
                    inline=False
                )
            
            try:
                await user.send(embed=notify_embed)
            except:
                pass
        
        await ctx.send(f"✅ Order **{order_id}** status updated to **{status.upper()}**")
    
    @commands.command(name='stats')
    @commands.has_permissions(administrator=True)
    async def view_stats(self, ctx):
        """View bot statistics"""
        
        products = db.get_products()
        orders = db._read_file(db.orders_file).get('orders', [])
        tickets = db._read_file(db.tickets_file).get('tickets', [])
        
        total_revenue = sum(order['price'] for order in orders if order['status'] == 'completed')
        pending_orders = len([o for o in orders if o['status'] == 'pending'])
        open_tickets = len([t for t in tickets if t['status'] == 'open'])
        
        embed = discord.Embed(
            title="📊 Bot Statistics",
            color=0x00ff9d,
            timestamp=discord.utils.utcnow()
        )
        
        embed.add_field(name="📦 Total Products", value=f"`{len(products)}`", inline=True)
        embed.add_field(name="🛒 Total Orders", value=f"`{len(orders)}`", inline=True)
        embed.add_field(name="💰 Total Revenue", value=f"`${total_revenue:.2f}`", inline=True)
        embed.add_field(name="⏳ Pending Orders", value=f"`{pending_orders}`", inline=True)
        embed.add_field(name="🎫 Open Tickets", value=f"`{open_tickets}`", inline=True)
        embed.add_field(name="👥 Total Users", value=f"`{len(ctx.guild.members)}`", inline=True)
        
        await ctx.send(embed=embed)

    @commands.command(name='ping')
    async def ping_command(self, ctx):
        """Show bot latency and runtime statistics"""
        latency_ms = round(self.bot.latency * 1000, 2)
        guild_count = len(self.bot.guilds)
        user_count = sum(guild.member_count or 0 for guild in self.bot.guilds)
        command_count = len(self.bot.commands)
        uptime_delta = discord.utils.utcnow() - getattr(self.bot, 'launch_time', discord.utils.utcnow())
        uptime_text = str(uptime_delta).split('.')[0]

        embed = discord.Embed(
            title="🏓 ZeroDay Tools Status",
            description="Advanced runtime snapshot for the bot.",
            color=0x00ff9d,
            timestamp=discord.utils.utcnow()
        )

        embed.add_field(name="Latency", value=f"`{latency_ms} ms`", inline=True)
        embed.add_field(name="Servers", value=f"`{guild_count}`", inline=True)
        embed.add_field(name="Users", value=f"`{user_count}`", inline=True)
        embed.add_field(name="Commands", value=f"`{command_count}`", inline=True)
        embed.add_field(name="Uptime", value=f"`{uptime_text}`", inline=True)
        embed.add_field(name="Python", value=f"`{platform.python_version()}`", inline=True)
        embed.add_field(name="discord.py", value=f"`{discord.__version__}`", inline=True)
        embed.add_field(name="Platform", value=f"`{platform.system()} {platform.release()}`", inline=True)
        embed.add_field(name="PID", value=f"`{os.getpid()}`", inline=True)

        if guild_count:
            embed.add_field(
                name="Average Users / Server",
                value=f"`{round(user_count / guild_count, 2)}`",
                inline=True
            )

        embed.set_footer(text="ZeroDay Tools")
        await ctx.send(embed=embed)

    @commands.command(name='purge')
    async def purge_command(self, ctx, amount: int):
        """Owner-only bulk delete for 0-300 messages"""
        if ctx.author.id != OWNER_ID:
            await ctx.send("❌ This command is owner-only.")
            return

        if amount < 0 or amount > 300:
            await ctx.send("❌ Amount must be between 0 and 300.")
            return

        if amount == 0:
            await ctx.send("ℹ️ Nothing to purge.")
            return

        deleted = await ctx.channel.purge(limit=amount + 1)
        confirmation = await ctx.send(f"✅ Deleted `{max(len(deleted) - 1, 0)}` messages.")
        await confirmation.delete(delay=5)
    
    @commands.command(name='help')
    async def help_command(self, ctx):
        """Display help menu"""
        help_embed = embeds.help_embed()
        await ctx.send(embed=help_embed)

async def setup(bot):
    await bot.add_cog(Admin(bot))
