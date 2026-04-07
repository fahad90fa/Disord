import json
from typing import List, Optional, Tuple

import discord
from discord.ext import commands

OWNER_ID = 1170979888019292261


# Custom Self-Made Cybersecurity Tools (Not Open Source, Not on Linux)
CYBERSECURITY_ITEMS: List[Tuple[str, str]] = [
    # C2 Frameworks
    ("Cobalt Strike", "Premium post-exploitation framework with advanced beacon payloads and malleable C2 profiles"),
    ("Brute Ratel C4", "EDR-evasive red team C2 designed to bypass modern security solutions"),
    ("Nighthawk", "Stealth-focused C2 with sleep mask encryption and advanced OPSEC features"),
    ("Silver", "Cross-platform C2 with dynamic code generation and stageless implants"),
    ("Mythic", "Collaborative multi-platform C2 framework with custom agent support"),
    ("Havoc", "Modern post-exploitation command and control framework with web interface"),
    ("Covenant", ".NET-based C2 framework for red team operations and post-exploitation"),
    ("PoshC2", "PowerShell-based C2 framework with advanced evasion and persistence capabilities"),
    
    # Exploit Frameworks
    ("Core Impact", "Enterprise penetration testing platform with 800+ professional exploits"),
    ("Immunity Canvas", "Professional exploit development framework with MOSDEF exploitation language"),
    ("Metasploit Pro", "Commercial version with automation, phishing campaigns, and web app testing"),
    ("D2 Exploit Pack", "Web-based exploitation toolkit with zero-day modules and browser exploits"),
    ("Veil Framework", "Payload generator designed to bypass antivirus detection systems"),
    ("BeEF Pro", "Browser exploitation framework for client-side attacks and social engineering"),
    
    # Network Attack Tools
    ("Packet Squirrel", "Covert network implant device for man-in-the-middle attacks and packet capture"),
    ("WiFi Pineapple", "Wireless auditing platform for rogue AP creation and credential harvesting"),
    ("LAN Turtle", "Network reconnaissance device with persistent backdoor access capabilities"),
    ("Shark Jack", "Network attack tool for rapid network reconnaissance and payload delivery"),
    ("Screen Crab", "HDMI/VGA video capture device for physical security testing and surveillance"),
    ("Key Croc", "Keystroke injection and payload delivery USB device with remote access"),
    
    # Password & Credential Tools
    ("Elcomsoft DPPR", "GPU-accelerated distributed password cracking for 500+ file formats"),
    ("Passware Kit Forensic", "Full disk encryption breaking and live memory analysis tool"),
    ("Oxygen Forensic Detective", "Mobile and cloud password recovery platform with AI analysis"),
    ("Hashcat Custom Builds", "Advanced GPU password cracking with proprietary algorithms and optimizations"),
    ("L0phtCrack", "Windows password auditing and recovery tool with rainbow table support"),
    
    # Mobile Exploitation
    ("Cellebrite UFED", "Mobile forensics extraction for iOS/Android devices with cloud data access"),
    ("GrayKey", "iPhone unlocking and data extraction tool for law enforcement agencies"),
    ("XRY", "Mobile device forensics and encrypted data recovery platform"),
    ("MOBILedit Forensic", "Mobile phone data extraction and analysis platform with deleted data recovery"),
    ("Magnet AXIOM", "Digital forensics platform for mobile and computer evidence examination"),
    
    # Web Application Testing
    ("Burp Suite Professional", "Advanced web vulnerability scanner with exploitation tools and extensions"),
    ("Acunetix Premium", "Automated web app scanner with exploit verification and compliance reporting"),
    ("Netsparker", "Automated security scanner with proof-based vulnerability detection"),
    ("AppScan", "IBM's enterprise web application security testing solution with remediation"),
    ("WebInspect", "Dynamic application security testing (DAST) tool for web applications"),
    
    # RATs & Remote Access
    ("Poison Ivy", "Remote access trojan with keylogging, screen capture, and file transfer"),
    ("DarkComet RAT", "Remote administration tool with system monitoring and webcam access"),
    ("njRAT", "Lightweight RAT with botnet capabilities and remote desktop features"),
    ("Orcus RAT", "Commercial remote administration tool with plugin system and encryption"),
    ("AsyncRAT", "Open-source RAT with encrypted communication and persistence mechanisms"),
    
    # Phishing Tools
    ("King Phisher", "Phishing campaign toolkit with email tracking and analytics dashboard"),
    ("Gophish Pro", "Professional phishing simulation and security awareness training platform"),
    ("Social-Engineer Toolkit Custom", "Advanced social engineering attack framework with custom modules"),
    ("EvilGinx2", "Man-in-the-middle phishing framework bypassing 2FA authentication"),
    ("Modlishka", "Reverse proxy phishing tool for credential harvesting and session hijacking"),
    
    # Digital Forensics
    ("EnCase Forensic", "Industry-standard digital forensics and incident response platform"),
    ("FTK (Forensic Toolkit)", "Computer forensics with email analysis and registry examination"),
    ("X-Ways Forensics", "Integrated computer forensics and disk imaging tool for investigators"),
    ("BlackLight", "Advanced forensic analysis for hidden and deleted data recovery"),
    ("Autopsy Commercial", "Digital forensics platform with timeline analysis and file carving"),
    
    # Cloud Attack Tools
    ("Pacu", "AWS exploitation framework for privilege escalation and data exfiltration"),
    ("CloudSploit", "Cloud security scanner for AWS/Azure/GCP misconfiguration detection"),
    ("ScoutSuite", "Multi-cloud security auditing tool for configuration assessment"),
    ("Prowler", "AWS security assessment and hardening tool with compliance checks"),
    ("Rhino Security Labs Tools", "Suite of cloud penetration testing utilities and exploits"),
    
    # Database Attack
    ("SQLMap Pro", "Automated SQL injection and database takeover tool with advanced features"),
    ("Havij", "Automated SQL injection tool with database extraction capabilities"),
    ("SQLNinja", "SQL Server injection and takeover tool for Microsoft databases"),
    ("SQLSentinel", "Database security scanner and penetration testing tool"),
    ("NoSQLMap", "NoSQL database exploitation and enumeration tool for MongoDB/Redis"),
    
    # Wireless Attack
    ("Aircrack-ng Pro", "Advanced WiFi security auditing and password cracking suite"),
    ("Fern WiFi Cracker", "Wireless security auditing tool with GUI interface and automation"),
    ("CommView for WiFi", "Wireless network monitor and packet analyzer for Windows"),
    ("OmniPeek", "Enterprise wireless network analysis and troubleshooting platform"),
    ("Kismet Commercial", "Wireless network detector and intrusion detection system"),
    
    # IoT & Hardware
    ("Ubertooth One", "Bluetooth monitoring and exploitation device for BLE attacks"),
    ("HackRF One", "Software-defined radio for RF analysis and transmission testing"),
    ("Proxmark3", "RFID/NFC research and penetration testing tool with cloning capabilities"),
    ("Flipper Zero", "Portable multi-tool for hardware hacking and pentesting operations"),
    ("ChipWhisperer", "Side-channel analysis and hardware security testing platform"),
    
    # Advanced Persistence & Rootkits
    ("Hacker Defender", "User-mode rootkit for Windows systems with process hiding"),
    ("FU Rootkit", "Kernel-mode rootkit with process hiding and file cloaking"),
    ("Necurs", "Advanced rootkit with kernel-level privileges and network backdoor"),
    ("Alureon", "Bootkit malware for persistent system compromise and data theft"),
    ("TDL4", "Rootkit with bootkit capabilities and network backdoor functionality"),
    
    # Network Scanners
    ("Nmap NSE Pro", "Advanced network scanning with custom scripts and vulnerability detection"),
    ("Nessus Professional", "Comprehensive vulnerability scanner with compliance auditing"),
    ("QualysGuard", "Cloud-based vulnerability management platform with asset discovery"),
    ("OpenVAS Enterprise", "Commercial vulnerability assessment scanner with reporting"),
    ("Retina Network Scanner", "Enterprise network vulnerability assessment and patch management"),
    
    # Data Exfiltration
    ("DNSExfiltrator", "Data exfiltration over DNS queries to bypass firewall restrictions"),
    ("Iodine", "IP-over-DNS tunneling tool for covert communication channels"),
    ("PyExfil", "Python data exfiltration framework with multiple covert channels"),
    ("Cloakify", "Data exfiltration via text-based steganography and obfuscation"),
    ("PowerShell Empire", "Post-exploitation framework with data theft and lateral movement modules"),
    
    # Bypass & Evasion
    ("Veil-Evasion", "Payload generator to bypass antivirus and endpoint detection systems"),
    ("Shellter", "Dynamic shellcode injection tool with polymorphic code generation"),
    ("TheFatRat", "Backdoor generator with AV evasion and multi-platform support"),
    ("Unicorn", "PowerShell downgrade attack framework for security control bypass"),
    ("Invoke-Obfuscation", "PowerShell script obfuscation framework for detection evasion"),
    
    # Zero-Day & Exploit Marketplaces
    ("Zerodium", "Zero-day exploit acquisition platform paying $100k-$2.5M per vulnerability"),
    ("Exodus Intelligence", "Zero-day research and exploit subscription service for enterprises"),
    ("Crowdfense", "Bug bounty platform for high-value vulnerabilities and exploits"),
    ("Vulnerability Lab", "Private exploit development and responsible disclosure platform"),
    ("VUPEN", "Zero-day exploit provider for government agencies and defense contractors"),
]

TRADINGVIEW_ITEMS: List[Tuple[str, str]] = [
    ("Lux Algo Premium", "75-85% win rate - Advanced trend detection with dynamic support/resistance and smart money concepts"),
    ("Market Cipher B", "70-80% accuracy - Multi-timeframe momentum indicator combining VWAP, RSI, and wave trends"),
    ("Volatility Box", "72-82% success - Identifies high-probability breakout zones with volatility compression analysis"),
    ("Scalping Master Pro", "78-88% win rate - Short-term scalping signals with noise filtering and trend confirmation"),
    ("Quantum Trading Indicators", "71-79% accuracy - Institutional order flow and smart money tracking system"),
    ("WaveTrend 3D Premium", "73-81% win rate - Multi-dimensional wave oscillator with divergence detection"),
    ("AutoFib Elite", "76-84% accuracy - Automatic Fibonacci retracement with golden zone alerts"),
    ("Smart Money Concepts (SMC) Pro", "74-83% success - Order blocks, liquidity zones, and market structure analysis"),
    ("Supply & Demand Elite", "77-85% win rate - Institutional supply/demand zones with volume confirmation"),
    ("Ichimoku Cloud Pro", "69-77% accuracy - Enhanced Ichimoku system with advanced cloud analysis"),
    ("RSI Divergence Hunter", "76-84% win rate - Automatic RSI divergence detection with multi-timeframe analysis"),
    ("MACD Pro Elite", "72-80% accuracy - Enhanced MACD with histogram optimization and trend filters"),
    ("Stochastic Momentum Index Pro", "74-82% success - Advanced stochastic with overbought/oversold zones"),
    ("Volume Profile Premium", "79-87% win rate - Professional volume analysis with POC and value areas"),
    ("Money Flow Index Elite", "71-79% accuracy - Volume-weighted RSI for institutional money tracking"),
    ("Awesome Oscillator Pro", "70-78% win rate - Enhanced momentum signals for trend timing"),
    ("Relative Vigor Index Premium", "73-81% success - Candlestick momentum with trend confirmation"),
    ("Chaikin Money Flow Elite", "75-83% accuracy - Volume-based accumulation/distribution indicator"),
    ("Klinger Oscillator Pro", "72-80% win rate - Long-term money flow with volume force analysis"),
    ("True Strength Index Premium", "74-82% success - Momentum oscillator with trend direction filtering"),
    ("Order Flow Suite", "80-88% win rate - Institutional order flow analysis with delta and footprint charts"),
    ("VWAP Premium Suite", "77-85% accuracy - Multi-timeframe VWAP with standard deviation bands"),
    ("Cumulative Volume Delta (CVD)", "78-86% success - Real-time buying/selling pressure analysis"),
    ("Market Profile Pro", "81-89% win rate - TPO-based market structure and value area detection"),
    ("Volume Spread Analysis (VSA)", "75-83% accuracy - Wyckoff method automation with volume analysis"),
    ("On-Balance Volume (OBV) Elite", "73-81% win rate - Cumulative volume with trend confirmation"),
    ("Accumulation/Distribution Pro", "76-84% success - Institutional accumulation and distribution zones"),
    ("Volume Weighted Average Price Bands", "79-87% accuracy - Dynamic VWAP channels with breakout alerts"),
    ("Delta Volume Indicator", "77-85% win rate - Bid/ask imbalance detection for scalping"),
    ("Footprint Chart Pro", "82-90% success - Order book visualization with liquidity analysis"),
]

MT5_BOT_ITEMS: List[Tuple[str, str]] = [
    ("Forex Fury", "82-90% win rate - High-frequency scalping EA with adaptive algorithms"),
    ("GPS Forex Robot", "78-86% monthly profit - Multi-pair scalping with low drawdown"),
    ("WallStreet Forex Robot 3.0", "80-88% accuracy - Stealth mode scalping with virtual stops"),
    ("Scalper Gold Pro", "85-92% win rate - XAUUSD specialist with news filter integration"),
    ("Happy Forex EA", "77-85% success - Conservative scalping with 1:3 risk-reward ratio"),
    ("FX Stabilizer", "79-87% accuracy - Multi-strategy scalping with correlation filtering"),
    ("Stealth Scalper Pro", "81-89% win rate - Tick-based scalping with fast execution logic"),
    ("Goldminer Pro EA", "83-91% success - Gold scalping with volatility-based position sizing"),
    ("Rapid Scalper MT5", "78-86% accuracy - Quick entry/exit system with trailing stops"),
    ("Micro Scalper Elite", "80-88% win rate - Micro-lot scalping for compounding growth"),
    ("Grid Master Pro", "75-83% profit factor - Intelligent grid with dynamic spacing and hedging"),
    ("Infinity Grid EA", "77-85% monthly return - Bi-directional grid with profit locking"),
    ("Smart Grid System", "76-84% success - Adaptive grid sizing based on volatility"),
    ("Martingale Recovery Bot", "73-81% win rate - Controlled martingale with max drawdown limits"),
    ("Zone Recovery EA", "78-86% accuracy - Zone trading with averaging and hedging"),
    ("Golden Grid Robot", "79-87% profit ratio - Grid trading optimized for gold pairs"),
    ("Anti-Martingale Pro", "81-89% success - Reverse martingale for trend-following profits"),
    ("Dynamic Grid Trader", "77-85% win rate - ATR-based grid spacing with breakeven management"),
    ("Hedge Grid Master", "76-84% accuracy - Dual-direction grid with correlation hedging"),
    ("Perpetual Grid EA", "80-88% monthly gain - Long-term grid strategy with compounding"),
    ("Forex Diamond EA", "82-90% win rate - Multi-indicator trend following with smart exits"),
    ("FX Core 100", "79-87% accuracy - News-based trend trading with volatility filters"),
    ("Trend Hunter Pro", "81-89% success - Swing trading bot with multi-timeframe analysis"),
    ("Momentum Master EA", "78-86% win rate - Momentum breakout system with trailing stops"),
    ("Trend Rider Robot", "80-88% profit ratio - Long-term trend capture with pyramiding"),
    ("Breakout Pro EA", "83-91% accuracy - Range breakout detection with volume confirmation"),
    ("Wave Trend Follower", "77-85% win rate - Elliott Wave-based automated trading"),
    ("Ichimoku Auto Trader", "76-84% success - Cloud-based trend following with filters"),
    ("ADX Trend Master", "79-87% accuracy - ADX-filtered trend trading with RSI confirmation"),
    ("Super Trend EA", "81-89% win rate - SuperTrend automation with dynamic stops"),
]

ITEMS_PER_PAGE = 8
STORE_ICON = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
TRADING_ICON = "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80"
CYBER_ICON = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80"


def chunked(items: List[Tuple[str, str]], page: int) -> List[Tuple[str, str]]:
    start = page * ITEMS_PER_PAGE
    end = start + ITEMS_PER_PAGE
    return items[start:end]


def total_pages(items: List[Tuple[str, str]]) -> int:
    return max(1, (len(items) + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE)


def build_home_embed() -> discord.Embed:
    embed = discord.Embed(
        title="",
        description="",
        color=0x0A0E27
    )
    
    embed.set_author(
        name="⚡ APEX PREMIUM MARKETPLACE",
        icon_url=STORE_ICON
    )
    
    embed.description = (
        "```ansi\n"
        "\u001b[1;36m╔═══════════════════════════════════════════════════╗\n"
        "\u001b[1;36m║                                                   ║\n"
        "\u001b[1;36m║     🏆  ELITE DIGITAL SOLUTIONS STOREFRONT  🏆    ║\n"
        "\u001b[1;36m║                                                   ║\n"
        "\u001b[1;36m╚═══════════════════════════════════════════════════╝\n"
        "```\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        "**🎯 FEATURED COLLECTIONS**\n\n"
        "> 🛡️ **Cybersecurity Arsenal** - Custom self-made professional tools\n"
        "> 📈 **TradingView Indicators** - Premium trading signals & analytics\n"
        "> 🤖 **MT5 Algorithmic Bots** - Automated trading solutions\n\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    
    embed.add_field(
        name="",
        value=(
            "```yaml\n"
            "🌟 PREMIUM FEATURES\n"
            "━━━━━━━━━━━━━━━━━━━\n"
            "✓ Lifetime Updates\n"
            "✓ 24/7 Support Team\n"
            "✓ Instant Delivery\n"
            "✓ Money-Back Guarantee\n"
            "✓ Private Community Access\n"
            "```"
        ),
        inline=True
    )
    
    embed.add_field(
        name="",
        value=(
            "```fix\n"
            "📊 MARKETPLACE STATS\n"
            "━━━━━━━━━━━━━━━━━━━\n"
            "Products: 180+\n"
            "Categories: 3\n"
            "Success Rate: 95%\n"
            "Customers: 1000+\n"
            "Uptime: 99.9%\n"
            "```"
        ),
        inline=True
    )
    
    embed.add_field(
        name="",
        value=(
            "```diff\n"
            "+ SECURE CHECKOUT PROCESS\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "1️⃣ Browse Collections\n"
            "2️⃣ Create Support Ticket\n"
            "3️⃣ Receive Custom Quote\n"
            "4️⃣ Complete Payment\n"
            "5️⃣ Instant Access Granted\n"
            "```"
        ),
        inline=False
    )
    
    embed.set_footer(
        text="💎 Navigate using buttons below • Use !ticket for pricing inquiries",
        icon_url=STORE_ICON
    )
    
    embed.set_thumbnail(url=STORE_ICON)
    
    return embed


def build_cybersecurity_embed(page: int = 0) -> discord.Embed:
    page_count = total_pages(CYBERSECURITY_ITEMS)
    page_items = chunked(CYBERSECURITY_ITEMS, page)
    
    embed = discord.Embed(
        title="",
        description="",
        color=0x8B0000
    )
    
    embed.set_author(
        name="🛡️ CUSTOM CYBERSECURITY ARSENAL",
        icon_url=CYBER_ICON
    )
    
    embed.description = (
        "```ansi\n"
        "\u001b[1;31m╔═══════════════════════════════════════════════════╗\n"
        "\u001b[1;31m║   PROPRIETARY RED TEAM & PENTESTING TOOLKIT      ║\n"
        "\u001b[1;31m║   Self-Made • Non-Open Source • Professional     ║\n"
        "\u001b[1;31m╚═══════════════════════════════════════════════════╝\n"
        "```\n"
        "**⚠️ AUTHORIZED USE ONLY • LEGAL COMPLIANCE REQUIRED**\n"
        f"**📊 Total Arsenal:** `{len(CYBERSECURITY_ITEMS)} Custom Tools` • Page `{page + 1}/{page_count}`\n"
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    )
    
    # Display tools
    for index, (name, details) in enumerate(page_items, start=page * ITEMS_PER_PAGE + 1):
        # Categorize with emoji
        if any(x in name.lower() for x in ['cobalt', 'brute', 'nighthawk', 'silver', 'mythic', 'havoc', 'covenant', 'posh']):
            emoji = "🎯"
            category = "C2"
        elif any(x in name.lower() for x in ['core', 'immunity', 'metasploit', 'd2', 'veil', 'beef']):
            emoji = "💥"
            category = "Exploit"
        elif any(x in name.lower() for x in ['packet', 'wifi', 'lan', 'shark', 'screen', 'key']):
            emoji = "🌐"
            category = "Network"
        elif any(x in name.lower() for x in ['elcomsoft', 'passware', 'oxygen', 'hashcat', 'l0pht']):
            emoji = "🔐"
            category = "Password"
        elif any(x in name.lower() for x in ['cellebrite', 'graykey', 'xry', 'mobiledit', 'magnet']):
            emoji = "📱"
            category = "Mobile"
        elif any(x in name.lower() for x in ['burp', 'acunetix', 'netsparker', 'appscan', 'webinspect']):
            emoji = "🌍"
            category = "WebApp"
        elif any(x in name.lower() for x in ['poison', 'darkcomet', 'njrat', 'orcus', 'async']):
            emoji = "👾"
            category = "RAT"
        elif any(x in name.lower() for x in ['king', 'gophish', 'social', 'evilginx', 'modlishka']):
            emoji = "🎣"
            category = "Phishing"
        elif any(x in name.lower() for x in ['encase', 'ftk', 'x-ways', 'blacklight', 'autopsy']):
            emoji = "🕵️"
            category = "Forensics"
        elif any(x in name.lower() for x in ['pacu', 'cloudsploit', 'scout', 'prowler', 'rhino']):
            emoji = "☁️"
            category = "Cloud"
        elif any(x in name.lower() for x in ['sqlmap', 'havij', 'sqlninja', 'sqlsentinel', 'nosql']):
            emoji = "💾"
            category = "Database"
        elif any(x in name.lower() for x in ['aircrack', 'fern', 'commview', 'omnipeek', 'kismet']):
            emoji = "📡"
            category = "Wireless"
        elif any(x in name.lower() for x in ['ubertooth', 'hackrf', 'proxmark', 'flipper', 'chipwhisperer']):
            emoji = "🔧"
            category = "Hardware"
        elif any(x in name.lower() for x in ['hacker defender', 'rootkit', 'necurs', 'alureon', 'tdl4']):
            emoji = "💀"
            category = "Rootkit"
        elif any(x in name.lower() for x in ['nmap', 'nessus', 'qualys', 'openvas', 'retina']):
            emoji = "🔍"
            category = "Scanner"
        elif any(x in name.lower() for x in ['dns', 'iodine', 'pyexfil', 'cloakify', 'empire']):
            emoji = "📤"
            category = "Exfil"
        elif any(x in name.lower() for x in ['veil', 'shellter', 'fatrat', 'unicorn', 'invoke']):
            emoji = "🥷"
            category = "Evasion"
        elif any(x in name.lower() for x in ['zerodium', 'exodus', 'crowdfense', 'vulnerability', 'vupen']):
            emoji = "💎"
            category = "ZeroDay"
        else:
            emoji = "⚡"
            category = "Advanced"
        
        embed.add_field(
            name=f"{emoji} **{index:02d}.** {name} `[{category}]`",
            value=f"> {details}",
            inline=False
        )
    
    # Category breakdown
    if page == 0:
        embed.add_field(
            name="",
            value=(
                "```yaml\n"
                "📋 TOOL CATEGORIES\n"
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
                "🎯 C2 Frameworks:        8 tools\n"
                "💥 Exploit Frameworks:   6 tools\n"
                "🌐 Network Attack:       6 tools\n"
                "🔐 Password Tools:       5 tools\n"
                "📱 Mobile Exploitation:  5 tools\n"
                "🌍 Web App Testing:      5 tools\n"
                "👾 RATs & Remote:        5 tools\n"
                "🎣 Phishing Suite:       5 tools\n"
                "🕵️ Digital Forensics:    5 tools\n"
                "☁️ Cloud Attack:         5 tools\n"
                "💾 Database Attack:      5 tools\n"
                "📡 Wireless Attack:      5 tools\n"
                "🔧 IoT & Hardware:       5 tools\n"
                "💀 Rootkits:             5 tools\n"
                "🔍 Network Scanners:     5 tools\n"
                "📤 Data Exfiltration:    5 tools\n"
                "🥷 Bypass & Evasion:     5 tools\n"
                "💎 Zero-Day Exploits:    5 tools\n"
                "```"
            ),
            inline=False
        )
    
    embed.add_field(
        name="⚖️ **LEGAL REQUIREMENTS**",
        value=(
            "```diff\n"
            "- MANDATORY AUTHORIZATION\n"
            "+ Valid Certifications (CEH/OSCP/GPEN)\n"
            "+ Written Permission & Contracts\n"
            "+ Background Verification Required\n"
            "- Unauthorized Use = Federal Crime (CFAA)\n"
            "```"
        ),
        inline=False
    )
    
    embed.add_field(
        name="💎 **WHAT'S INCLUDED**",
        value=(
            "> ✅ Custom-built proprietary tools\n"
            "> ✅ Not available on Linux/Kali\n"
            "> ✅ Lifetime updates & patches\n"
            "> ✅ 24/7 technical support\n"
            "> ✅ Private training materials\n"
            "> ✅ Compliance documentation\n"
            "> ✅ Secure license management"
        ),
        inline=True
    )
    
    embed.add_field(
        name="🎫 **GET CUSTOM PRICING**",
        value=(
            "> **Create a ticket for:**\n"
            "> • Individual tool quotes\n"
            "> • Bundle packages\n"
            "> • Enterprise licensing\n"
            "> • Volume discounts\n"
            "> • Custom deployments\n\n"
            "> 🎟️ **Use `!ticket` command**"
        ),
        inline=True
    )
    
    embed.set_footer(
        text=f"🔒 Page {page + 1}/{page_count} • Proprietary Tools • Licensed Professionals Only",
        icon_url=CYBER_ICON
    )
    
    embed.set_thumbnail(url=CYBER_ICON)
    
    return embed


def build_catalog_embed(title: str, subtitle: str, items: List[Tuple[str, str]], page: int, color: int, icon: str) -> discord.Embed:
    page_count = total_pages(items)
    page_items = chunked(items, page)
    
    embed = discord.Embed(
        title="",
        description="",
        color=color
    )
    
    embed.set_author(
        name=title,
        icon_url=icon
    )
    
    # Header with stats
    embed.description = (
        f"```ansi\n"
        f"\u001b[1;36m{'═' * 50}\n"
        f"\u001b[1;36m{subtitle.center(50)}\n"
        f"\u001b[1;36m{'═' * 50}\n"
        f"```\n"
        f"**📊 Catalog Info:** `{len(items)}` Total Products • Page `{page + 1}/{page_count}`\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    )
    
    # Display items in clean format
    for index, (name, details) in enumerate(page_items, start=page * ITEMS_PER_PAGE + 1):
        # Clean emoji based on performance
        if "90%" in details or "85%" in details:
            emoji = "⭐"
        elif "80%" in details or "75%" in details:
            emoji = "🔥"
        else:
            emoji = "✨"
        
        embed.add_field(
            name=f"{emoji} **{index:02d}.** {name}",
            value=f"> {details[:180]}{'...' if len(details) > 180 else ''}",
            inline=False
        )
    
    # Pricing info
    embed.add_field(
        name="",
        value=(
            "```css\n"
            "💰 PRICING & PURCHASE\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "[!] Custom quotes available\n"
            "[!] Volume discounts offered\n"
            "[!] Flexible payment plans\n\n"
            "Use !ticket command for pricing\n"
            "```"
        ),
        inline=False
    )
    
    embed.set_footer(
        text=f"Page {page + 1} of {page_count} • Use navigation buttons • Create ticket for pricing",
        icon_url=icon
    )
    
    embed.set_thumbnail(url=icon)
    
    return embed


class StorefrontView(discord.ui.View):
    def __init__(self, page_type: str = "home", page: int = 0, private_browser: bool = False):
        super().__init__(timeout=900 if private_browser else None)
        self.page_type = page_type
        self.page = page
        self.private_browser = private_browser
        self._sync_buttons()

    def _sync_buttons(self):
        for item in self.children:
            if item.custom_id == "store_prev":
                item.disabled = self.page == 0 or self.page_type == "home"
            elif item.custom_id == "store_next":
                if self.page_type == "cybersecurity":
                    item.disabled = self.page >= total_pages(CYBERSECURITY_ITEMS) - 1
                elif self.page_type == "tradingview":
                    item.disabled = self.page >= total_pages(TRADINGVIEW_ITEMS) - 1
                elif self.page_type == "mt5":
                    item.disabled = self.page >= total_pages(MT5_BOT_ITEMS) - 1
                else:
                    item.disabled = True

    def build_embed(self, page_type: str, page: int = 0):
        self.page_type = page_type
        self.page = page
        self._sync_buttons()

        if page_type == "cybersecurity":
            return build_cybersecurity_embed(page)
        if page_type == "tradingview":
            return build_catalog_embed(
                "📈 TradingView Premium Indicators",
                "PROFESSIONAL TRADING SIGNALS & ANALYTICS",
                TRADINGVIEW_ITEMS,
                page,
                0x00D9FF,
                TRADING_ICON
            )
        if page_type == "mt5":
            return build_catalog_embed(
                "🤖 MT5 Algorithmic Trading Bots",
                "AUTOMATED FOREX & CRYPTO SOLUTIONS",
                MT5_BOT_ITEMS,
                page,
                0xFF6B35,
                TRADING_ICON
            )
        return build_home_embed()

    async def open_private_browser(self, interaction: discord.Interaction, page_type: str, page: int = 0):
        private_view = StorefrontView(page_type=page_type, page=page, private_browser=True)
        embed = private_view.build_embed(page_type, page)
        await interaction.response.send_message(embed=embed, view=private_view, ephemeral=True)

    async def update_private_message(self, interaction: discord.Interaction, page_type: str, page: int = 0):
        embed = self.build_embed(page_type, page)
        await interaction.response.edit_message(embed=embed, view=self)

    @discord.ui.button(emoji="🏠", label="Home", style=discord.ButtonStyle.primary, custom_id="store_home", row=0)
    async def home_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.private_browser:
            await self.update_private_message(interaction, "home", 0)
            return
        await self.open_private_browser(interaction, "home", 0)

    @discord.ui.button(emoji="🛡️", label="Security", style=discord.ButtonStyle.danger, custom_id="store_cyber", row=0)
    async def cybersecurity_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.private_browser:
            await self.update_private_message(interaction, "cybersecurity", 0)
            return
        await self.open_private_browser(interaction, "cybersecurity", 0)

    @discord.ui.button(emoji="📈", label="Indicators", style=discord.ButtonStyle.success, custom_id="store_tradingview", row=0)
    async def tradingview_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.private_browser:
            await self.update_private_message(interaction, "tradingview", 0)
            return
        await self.open_private_browser(interaction, "tradingview", 0)

    @discord.ui.button(emoji="🤖", label="MT5 Bots", style=discord.ButtonStyle.success, custom_id="store_mt5", row=0)
    async def mt5_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if self.private_browser:
            await self.update_private_message(interaction, "mt5", 0)
            return
        await self.open_private_browser(interaction, "mt5", 0)

    @discord.ui.button(emoji="⬅️", style=discord.ButtonStyle.secondary, custom_id="store_prev", row=1)
    async def prev_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not self.private_browser:
            await interaction.response.send_message(
                "Use one of the section buttons first to open your private browser.",
                ephemeral=True
            )
            return
        if self.page_type != "home" and self.page > 0:
            await self.update_private_message(interaction, self.page_type, self.page - 1)
            return
        await interaction.response.defer()

    @discord.ui.button(emoji="➡️", style=discord.ButtonStyle.secondary, custom_id="store_next", row=1)
    async def next_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if not self.private_browser:
            await interaction.response.send_message(
                "Use one of the section buttons first to open your private browser.",
                ephemeral=True
            )
            return
        if self.page_type == "cybersecurity" and self.page < total_pages(CYBERSECURITY_ITEMS) - 1:
            await self.update_private_message(interaction, "cybersecurity", self.page + 1)
            return
        if self.page_type == "tradingview" and self.page < total_pages(TRADINGVIEW_ITEMS) - 1:
            await self.update_private_message(interaction, "tradingview", self.page + 1)
            return
        if self.page_type == "mt5" and self.page < total_pages(MT5_BOT_ITEMS) - 1:
            await self.update_private_message(interaction, "mt5", self.page + 1)
            return
        await interaction.response.defer()

    @discord.ui.button(emoji="🎫", label="Get Pricing", style=discord.ButtonStyle.blurple, custom_id="store_ticket", row=1)
    async def ticket_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        embed = discord.Embed(
            title="🎫 Create Support Ticket for Pricing",
            description=(
                "**To receive custom pricing and purchase:**\n\n"
                "Use the command:\n"
                "```\n!ticket [Your inquiry about specific product]\n```\n\n"
                "**Examples:**\n"
                "`!ticket Interested in Cobalt Strike pricing`\n"
                "`!ticket Need quote for Burp Suite Pro`\n"
                "`!ticket Enterprise license for MT5 bot bundle`\n\n"
                "Our team will respond within 24 hours with:\n"
                "✓ Custom pricing quote\n"
                "✓ Volume discounts\n"
                "✓ Payment options\n"
                "✓ Delivery timeline\n"
                "✓ License agreements"
            ),
            color=0x5865F2
        )
        embed.set_footer(text="Premium Support • Fast Response Time • Verified Sellers")
        await interaction.response.send_message(embed=embed, ephemeral=True)


class Setup(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.config_file = "config.json"

    def load_config(self):
        with open(self.config_file, "r") as f:
            return json.load(f)

    def save_config(self, config):
        with open(self.config_file, "w") as f:
            json.dump(config, f, indent=4)

    async def cog_load(self):
        self.bot.add_view(StorefrontView())

    async def ensure_category(self, guild, category_name: str):
        for category in guild.categories:
            if category.name.lower() == category_name.lower():
                return category

        return await guild.create_category(
            name=category_name,
            overwrites={
                guild.default_role: discord.PermissionOverwrite(read_messages=False),
                guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
            }
        )

    async def ensure_text_channel(self, guild, channel_name: str):
        for channel in guild.text_channels:
            if channel.name.lower() == channel_name.lower():
                return channel

        return await guild.create_text_channel(channel_name)

    async def post_storefront(self, channel: discord.TextChannel):
        embed = build_home_embed()
        await channel.send(embed=embed, view=StorefrontView())

    @commands.command(name="setup")
    @commands.has_permissions(administrator=True)
    async def setup_bot(self, ctx, sales_channel: Optional[discord.TextChannel] = None):
        """Configure the bot and post the premium storefront."""
        if ctx.author.id != OWNER_ID:
            await ctx.send("❌ This command is owner-only.")
            return

        config = self.load_config()

        if sales_channel is not None:
            ticket_category = await self.ensure_category(ctx.guild, "Tickets")
            log_channel = await self.ensure_text_channel(ctx.guild, "bot-logs")

            config["sales_channel"] = sales_channel.id
            config["ticket_category"] = ticket_category.id
            config["log_channel"] = log_channel.id
            config["admin_roles"] = [role.id for role in ctx.author.roles if role != ctx.guild.default_role]

            self.save_config(config)
            await self.post_storefront(sales_channel)

            embed = discord.Embed(
                title="✅ Storefront Deployed Successfully",
                description="Your premium marketplace is now live!",
                color=0x00FF00
            )
            embed.add_field(name="📢 Sales Channel", value=sales_channel.mention, inline=False)
            embed.add_field(name="🎫 Ticket Category", value=ticket_category.name, inline=False)
            embed.add_field(name="📝 Log Channel", value=log_channel.mention, inline=False)
            embed.add_field(
                name="📊 Statistics",
                value=f"```\nCybersecurity Tools: {len(CYBERSECURITY_ITEMS)}\nTrading Indicators: {len(TRADINGVIEW_ITEMS)}\nMT5 Bots: {len(MT5_BOT_ITEMS)}\nTotal Products: {len(CYBERSECURITY_ITEMS) + len(TRADINGVIEW_ITEMS) + len(MT5_BOT_ITEMS)}\n```",
                inline=False
            )
            embed.set_footer(text="Users can now browse products and create tickets for pricing")
            await ctx.send(embed=embed)
            return

        embed = discord.Embed(
            title="⚙️ Setup Wizard",
            description=(
                "**Configure your premium storefront:**\n\n"
                "```\n!setup #channel-name\n```\n\n"
                "**Example:**\n"
                "`!setup #sales`\n\n"
                "This will:\n"
                "✓ Set sales channel\n"
                "✓ Create ticket category\n"
                "✓ Create log channel\n"
                "✓ Deploy storefront menu\n"
                f"✓ List {len(CYBERSECURITY_ITEMS)} custom cybersecurity tools\n"
                f"✓ List {len(TRADINGVIEW_ITEMS)} trading indicators\n"
                f"✓ List {len(MT5_BOT_ITEMS)} MT5 bots"
            ),
            color=0x5865F2
        )
        await ctx.send(embed=embed)

    @commands.command(name="setchannel")
    @commands.has_permissions(administrator=True)
    async def set_channel(self, ctx, channel_type: str, channel: discord.TextChannel):
        """Set a specific channel."""
        config = self.load_config()

        if channel_type.lower() == "sales":
            config["sales_channel"] = channel.id
            await ctx.send(f"✅ Sales channel set to {channel.mention}")
        elif channel_type.lower() == "logs":
            config["log_channel"] = channel.id
            await ctx.send(f"✅ Log channel set to {channel.mention}")
        else:
            await ctx.send("❌ Invalid channel type. Use 'sales' or 'logs'")
            return

        self.save_config(config)


async def setup(bot):
    await bot.add_cog(Setup(bot))
