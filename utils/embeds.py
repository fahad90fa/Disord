
import discord
from datetime import datetime
from typing import List, Dict, Optional

class EmbedBuilder:
    
    @staticmethod
    def create_base_embed(title: str, description: str = "", color: int = 0x00ff9d) -> discord.Embed:
        """Create base embed with branding"""
        embed = discord.Embed(
            title=title,
            description=description,
            color=color,
            timestamp=datetime.now()
        )
        embed.set_footer(text="ZeroDay Tools", 
                        icon_url="https://i.imgur.com/your_icon.png")
        return embed
    
    @staticmethod
    def product_embed(product: Dict) -> discord.Embed:
        """Create product display embed"""
        embed = discord.Embed(
            title=f"🛡️ {product['name']}",
            description=product['description'],
            color=0x00ff9d,
            timestamp=datetime.now()
        )
        
        embed.add_field(name="💰 Price", value=f"`${product['price']}`", inline=True)
        embed.add_field(name="📦 Category", value=f"`{product['category']}`", inline=True)
        embed.add_field(name="📊 Stock", value=f"`{product.get('stock', 'Unlimited')}`", inline=True)
        
        if product.get('features'):
            features_text = "\n".join([f"✅ {feature}" for feature in product['features']])
            embed.add_field(name="✨ Features", value=features_text, inline=False)
        
        if product.get('image_url'):
            embed.set_thumbnail(url=product['image_url'])
        
        embed.set_footer(text=f"Product ID: {product['id']} | React to purchase")
        
        return embed
    
    @staticmethod
    def products_list_embed(products: List[Dict], category: str = "All") -> discord.Embed:
        """Create products list embed"""
        embed = discord.Embed(
            title=f"🛒 Available Products - {category}",
            description="Browse our premium tools and indicators",
            color=0x00ff9d,
            timestamp=datetime.now()
        )
        
        if not products:
            embed.add_field(name="📭 No Products", value="No products available in this category")
            return embed
        
        for product in products[:10]:  # Show first 10
            value = f"💰 **${product['price']}**\n📝 {product['description'][:100]}...\n🆔 Product ID: `{product['id']}`"
            embed.add_field(
                name=f"{product['name']}",
                value=value,
                inline=False
            )
        
        if len(products) > 10:
            embed.set_footer(text=f"Showing 10 of {len(products)} products | Use !product <id> for details")
        
        return embed
    
    @staticmethod
    def order_embed(order: Dict, product: Dict) -> discord.Embed:
        """Create order confirmation embed"""
        embed = discord.Embed(
            title="🎉 Order Confirmation",
            description=f"Thank you for your purchase!",
            color=0x00ff00,
            timestamp=datetime.now()
        )
        
        embed.add_field(name="📦 Product", value=product['name'], inline=False)
        embed.add_field(name="🆔 Order ID", value=f"`{order['order_id']}`", inline=True)
        embed.add_field(name="💰 Total", value=f"`${product['price']}`", inline=True)
        embed.add_field(name="📊 Status", value=f"`{order['status'].upper()}`", inline=True)
        
        embed.add_field(
            name="📝 Next Steps",
            value="1️⃣ Complete payment using provided details\n2️⃣ Submit payment proof\n3️⃣ Receive your product within 24hrs",
            inline=False
        )
        
        embed.set_thumbnail(url=product.get('image_url', ''))
        embed.set_footer(text=f"Order Date: {order['created_at']}")
        
        return embed
    
    @staticmethod
    def ticket_embed(ticket: Dict, ticket_type: str = "Support") -> discord.Embed:
        """Create ticket embed"""
        status_colors = {
            'open': 0x00ff00,
            'pending': 0xffa500,
            'closed': 0xff0000
        }
        
        embed = discord.Embed(
            title=f"🎫 Ticket #{ticket['ticket_id']}",
            description=ticket.get('description', 'No description provided'),
            color=status_colors.get(ticket['status'], 0x00ff9d),
            timestamp=datetime.now()
        )
        
        embed.add_field(name="📋 Type", value=ticket_type, inline=True)
        embed.add_field(name="📊 Status", value=ticket['status'].upper(), inline=True)
        embed.add_field(name="👤 User", value=f"<@{ticket['user_id']}>", inline=True)
        
        if ticket.get('assigned_to'):
            embed.add_field(name="👨‍💼 Assigned To", value=f"<@{ticket['assigned_to']}>", inline=True)
        
        embed.set_footer(text=f"Created: {ticket['created_at']}")
        
        return embed
    
    @staticmethod
    def help_embed() -> discord.Embed:
        """Create help embed"""
        embed = discord.Embed(
            title="📚 ZeroDay Tools - Command Guide",
            description="Discord storefront bot for trading tools, orders, and ticket management",
            color=0x00ff9d,
            timestamp=datetime.now()
        )
        
        embed.add_field(
            name="🛒 **Shopping Commands**",
            value=(
                "`!products` - View all products\n"
                "`!product <id>` - View specific product\n"
                "`!buy <id>` - Purchase a product\n"
                "`!orders` - View your orders"
            ),
            inline=False
        )
        
        embed.add_field(
            name="🎫 **Ticket Commands**",
            value=(
                "`!ticket <reason>` - Create support ticket\n"
                "`!closeticket` - Close your ticket\n"
                "`!mytickets` - View your tickets"
            ),
            inline=False
        )
        
        embed.add_field(
            name="⚙️ **Admin Commands**",
            value=(
                "`!setup #channel` - Owner-only storefront setup\n"
                "`!addproduct` - Add new product\n"
                "`!removeproduct <id>` - Remove product\n"
                "`!setstatus <order_id> <status>` - Update order status\n"
                "`!ping` - View bot latency and runtime stats"
            ),
            inline=False
        )
        
        embed.set_thumbnail(url="https://i.imgur.com/your_logo.png")
        embed.set_footer(text="ZeroDay Tools")
        
        return embed

# Global embed builder instance
embeds = EmbedBuilder()
