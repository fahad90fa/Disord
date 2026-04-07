
import discord
from discord.ext import commands
from discord import app_commands
from utils.database import db
from utils.embeds import embeds
import asyncio
from typing import Optional

class Products(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @commands.command(name='addproduct')
    @commands.has_permissions(administrator=True)
    async def add_product(self, ctx):
        """Interactive product addition"""
        
        embed = discord.Embed(
            title="➕ Add New Product",
            description="Let's add a new product to your store",
            color=0x00ff9d
        )
        await ctx.send(embed=embed)
        
        product_data = {}
        
        def check(m):
            return m.author == ctx.author and m.channel == ctx.channel
        
        questions = [
            ("Product Name", "name"),
            ("Description", "description"),
            ("Price (number only)", "price"),
            ("Category (Cybersecurity/MT5/Other)", "category"),
            ("Features (comma separated)", "features"),
            ("Image URL (optional, type 'skip' to skip)", "image_url"),
            ("Stock (type 'unlimited' for unlimited)", "stock")
        ]
        
        for question, key in questions:
            await ctx.send(f"**{question}:**")
            try:
                msg = await self.bot.wait_for('message', check=check, timeout=120.0)
                
                if key == "price":
                    product_data[key] = float(msg.content)
                elif key == "features":
                    product_data[key] = [f.strip() for f in msg.content.split(',')]
                elif key == "image_url" and msg.content.lower() == 'skip':
                    product_data[key] = None
                elif key == "stock":
                    product_data[key] = msg.content if msg.content.lower() == 'unlimited' else int(msg.content)
                else:
                    product_data[key] = msg.content
                    
            except asyncio.TimeoutError:
                await ctx.send("⏱️ Timeout! Product addition cancelled.")
                return
            except ValueError:
                await ctx.send("❌ Invalid input! Product addition cancelled.")
                return
        
        # Add product to database
        db.add_product(product_data)
        
        # Create product embed
        product = db.get_products()[-1]  # Get last added product
        product_embed = embeds.product_embed(product)
        
        await ctx.send("✅ Product added successfully!", embed=product_embed)
        
        # Post to sales channel
        config = self.load_config()
        if config.get('sales_channel'):
            channel = self.bot.get_channel(config['sales_channel'])
            if channel:
                msg = await channel.send(embed=product_embed)
                await msg.add_reaction('🛒')
    
    @commands.command(name='products')
    async def list_products(self, ctx, category: Optional[str] = None):
        """List all products or by category"""
        
        products = db.get_products(category)
        embed = embeds.products_list_embed(products, category or "All")
        
        await ctx.send(embed=embed)
    
    @commands.command(name='product')
    async def view_product(self, ctx, product_id: int):
        """View specific product details"""
        
        product = db.get_product_by_id(product_id)
        
        if not product:
            await ctx.send("❌ Product not found!")
            return
        
        embed = embeds.product_embed(product)
        msg = await ctx.send(embed=embed)
        await msg.add_reaction('🛒')
    
    @commands.command(name='buy')
    async def buy_product(self, ctx, product_id: int):
        """Purchase a product"""
        
        product = db.get_product_by_id(product_id)
        
        if not product:
            await ctx.send("❌ Product not found!")
            return
        
        # Create order
        order_data = {
            'user_id': ctx.author.id,
            'product_id': product_id,
            'price': product['price'],
            'status': 'pending'
        }
        
        order = db.create_order(order_data)
        
        # Create order embed
        order_embed = embeds.order_embed(order, product)
        
        # Send to user
        try:
            await ctx.author.send(embed=order_embed)
            await ctx.send("✅ Order created! Check your DMs for details.")
            
            # Create payment instructions embed
            payment_embed = discord.Embed(
                title="💳 Payment Instructions",
                description=f"Complete your payment for Order #{order['order_id']}",
                color=0xffa500
            )
            
            config = self.load_config()
            payment_methods = config.get('payment_methods', [])
            
            payment_embed.add_field(
                name="💰 Amount",
                value=f"`${product['price']}`",
                inline=False
            )
            
            payment_embed.add_field(
                name="📝 Payment Methods",
                value="\n".join([f"• {method}" for method in payment_methods]),
                inline=False
            )
            
            payment_embed.add_field(
                name="📤 Next Steps",
                value="1. Complete payment\n2. Send payment proof to support\n3. Wait for verification",
                inline=False
            )
            
            await ctx.author.send(embed=payment_embed)
            
            # Create ticket for the order
            ticket_data = {
                'user_id': ctx.author.id,
                'order_id': order['order_id'],
                'type': 'order',
                'description': f"Order for {product['name']}"
            }
            
            ticket = db.create_ticket(ticket_data)
            
            # Create ticket channel
            await self.create_ticket_channel(ctx.guild, ctx.author, ticket, order, product)
            
        except discord.Forbidden:
            await ctx.send("❌ Cannot send DM. Please enable DMs from server members.")
    
    async def create_ticket_channel(self, guild, user, ticket, order, product):
        """Create ticket channel for order"""
        config = self.load_config()
        category_id = config.get('ticket_category')
        
        if not category_id:
            return
        
        category = guild.get_channel(category_id)
        
        if not category:
            return
        
        # Create channel
        overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
        }
        
        channel = await guild.create_text_channel(
            name=f"order-{ticket['ticket_id']}",
            category=category,
            overwrites=overwrites
        )
        
        # Update ticket with channel ID
        db.update_ticket(ticket['ticket_id'], {'channel_id': channel.id})
        
        # Send welcome message
        welcome_embed = discord.Embed(
            title=f"🎫 Order Ticket - {ticket['ticket_id']}",
            description=f"Thank you for your purchase, {user.mention}!",
            color=0x00ff9d
        )
        
        welcome_embed.add_field(name="📦 Product", value=product['name'], inline=True)
        welcome_embed.add_field(name="💰 Amount", value=f"${product['price']}", inline=True)
        welcome_embed.add_field(name="🆔 Order ID", value=order['order_id'], inline=True)
        
        welcome_embed.add_field(
            name="📝 Instructions",
            value="Please upload your payment proof here.\nOur team will verify and deliver your product within 24 hours.",
            inline=False
        )
        
        await channel.send(user.mention, embed=welcome_embed)
    
    @commands.command(name='removeproduct')
    @commands.has_permissions(administrator=True)
    async def remove_product(self, ctx, product_id: int):
        """Remove a product"""
        
        product = db.get_product_by_id(product_id)
        
        if not product:
            await ctx.send("❌ Product not found!")
            return
        
        db.delete_product(product_id)
        await ctx.send(f"✅ Product **{product['name']}** has been removed.")
    
    @commands.command(name='orders')
    async def view_orders(self, ctx):
        """View your orders"""
        
        orders = db.get_user_orders(ctx.author.id)
        
        if not orders:
            await ctx.send("📭 You have no orders yet!")
            return
        
        embed = discord.Embed(
            title="📦 Your Orders",
            description=f"Total Orders: {len(orders)}",
            color=0x00ff9d
        )
        
        for order in orders[:10]:
            product = db.get_product_by_id(order['product_id'])
            status_emoji = {
                'pending': '⏳',
                'completed': '✅',
                'cancelled': '❌'
            }.get(order['status'], '❓')
            
            embed.add_field(
                name=f"{status_emoji} {order['order_id']}",
                value=f"Product: {product['name']}\nPrice: ${order['price']}\nStatus: {order['status']}",
                inline=False
            )
        
        await ctx.send(embed=embed)
    
    def load_config(self):
        import json
        with open('config.json', 'r') as f:
            return json.load(f)
    
    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload):
        """Handle product purchase reactions"""
        
        if payload.user_id == self.bot.user.id:
            return
        
        if str(payload.emoji) == '🛒':
            channel = self.bot.get_channel(payload.channel_id)
            message = await channel.fetch_message(payload.message_id)
            
            # Check if it's a product embed
            if message.embeds and 'Product ID:' in message.embeds[0].footer.text:
                user = self.bot.get_user(payload.user_id)
                
                # Extract product ID from footer
                footer_text = message.embeds[0].footer.text
                product_id = int(footer_text.split('Product ID: ')[1].split(' |')[0])
                
                # Create order
                product = db.get_product_by_id(product_id)
                
                if product:
                    order_data = {
                        'user_id': user.id,
                        'product_id': product_id,
                        'price': product['price'],
                        'status': 'pending'
                    }
                    
                    order = db.create_order(order_data)
                    order_embed = embeds.order_embed(order, product)
                    
                    try:
                        await user.send(embed=order_embed)
                        await channel.send(f"✅ {user.mention}, order created! Check your DMs.", delete_after=10)
                    except:
                        await channel.send(f"❌ {user.mention}, please enable DMs!", delete_after=10)
            
            # Remove reaction
            await message.remove_reaction(payload.emoji, payload.member)

async def setup(bot):
    await bot.add_cog(Products(bot))