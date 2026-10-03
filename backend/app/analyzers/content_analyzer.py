import re
from typing import List, Dict, Any
from backend.app.schemas.analysis import ContentIndicator

# Curated rules combining pattern matching and contextual regex
CONTENT_PATTERNS = [
    {
        "indicator": "Urgency & Time Pressure",
        "severity": "High",
        "patterns": [
            r"\b(within\s+\d+\s+(?:hours?|hrs?|minutes?|mins?|days?))\b",
            r"\b(immediately|immediate\s+action\s+required|urgent\s+action|action\s+required\s+immediately)\b",
            r"\b(act\s+now|time\s+sensitive|respond\s+promptly|expires?\s+today|expir(?:es?|ing)\s+in\s+\d+)\b",
            r"\b(final\s+(?:warning|notice|reminder)|last\s+chance|before\s+it\s+is\s+too\s+late)\b"
        ],
        "explanation": "Urgency is a primary social engineering tactic designed to induce panic and prompt impulsive actions before the victim can verify authenticity.",
        "weight": 12.0
    },
    {
        "indicator": "Account Suspension / Deactivation Threat",
        "severity": "Critical",
        "patterns": [
            r"\b(account\s+will\s+be\s+(?:suspended|terminated|deactivated|closed|locked|disabled|deleted))\b",
            r"\b(permanently\s+(?:deactivated|suspended|deleted|locked))\b",
            r"\b(loss\s+of\s+(?:access|mailbox|data|service))\b",
            r"\b(suspended\s+due\s+to\s+suspicious\s+activity|session\s+expired)\b",
            r"\b(access\s+revoked|network\s+connection\s+revoked)\b"
        ],
        "explanation": "Threatening service deactivation or loss of access creates artificial fear and coercion, pushing users to bypass standard security protocols.",
        "weight": 18.0
    },
    {
        "indicator": "Credential Request / Harvesting",
        "severity": "Critical",
        "patterns": [
            r"\b(enter\s+your\s+(?:password|credentials|login|passcode|pin|sso))\b",
            r"\b(verify\s+your\s+(?:identity|password|account|credentials|apple\s+id|login))\b",
            r"\b(re-?(?:enter|authenticate|login)\s+your\s+(?:credentials|password))\b",
            r"\b(confirm\s+your\s+(?:login|credentials|password|identity|tax\s+id))\b",
            r"\b(provide\s+your\s+(?:one-time|verification|passcode|seed\s+phrase|ssn))\b"
        ],
        "explanation": "Direct requests to input passwords, OTPs, or corporate SSO credentials are quintessential signs of credential harvesting campaigns.",
        "weight": 20.0
    },
    {
        "indicator": "Financial / Wire / Payroll Pressure",
        "severity": "High",
        "patterns": [
            r"\b(wire\s+transfer|direct\s+deposit|payroll\s+update|payroll\s+failed)\b",
            r"\b(overdue\s+invoice|outstanding\s+balance|past\s+due|collections\s+action)\b",
            r"\b(gift\s+cards?|itunes\s+card|apple\s+gift\s+card)\b",
            r"\b(banking\s+routing\s+numbers?|credit\s+card\s+statement|unusual\s+debit\s+transaction)\b",
            r"\b(cryptocurrency|bitcoin|seed\s+phrase|wallet\s+lock)\b"
        ],
        "explanation": "Financial urgency, unusual invoice demands, or gift card purchase requests target corporate funds and accounting vulnerabilities.",
        "weight": 15.0
    },
    {
        "indicator": "Password Reset / Expiration Claim",
        "severity": "High",
        "patterns": [
            r"\b(password\s+will\s+expire|password\s+expires?\s+in)\b",
            r"\b(reset\s+your\s+(?:security\s+)?password|keep\s+your\s+current\s+password)\b",
            r"\b(unauthorized\s+sign-in|unrecognized\s+(?:device|browser)|sign-in\s+attempt\s+blocked)\b",
            r"\b(reset\s+token|security\s+keychain|two-factor\s+authentication\s+reset)\b"
        ],
        "explanation": "Simulated security alerts and expiring password notices exploit trust in IT administration to intercept legitimate authentication tokens.",
        "weight": 14.0
    },
    {
        "indicator": "Prize / Reward / Unclaimed Refund",
        "severity": "Medium",
        "patterns": [
            r"\b(unclaimed\s+refund|tax\s+refund\s+status|claim\s+your\s+refund)\b",
            r"\b(you\s+(?:have\s+won|are\s+eligible\s+for|received\s+a\s+bonus))\b",
            r"\b(free\s+gift|lottery\s+winner|annual\s+salary\s+bonus\s+statements?)\b",
            r"\b(cash\s+prize|reward\s+payout)\b"
        ],
        "explanation": "Dangling unearned financial gains or prizes lures targets into willingly divulging sensitive personal identification or financial accounts.",
        "weight": 12.0
    },
    {
        "indicator": "Parcel / Delivery Scam Pattern",
        "severity": "Medium",
        "patterns": [
            r"\b(pending\s+customs\s+duty|customs\s+clearance|customs\s+duty\s+payment)\b",
            r"\b(delivery\s+attempt\s+failed|parcel\s+pending\s+delivery|package\s+#\w+)\b",
            r"\b(missing\s+apartment\s+number|redelivery\s+fee|update\s+delivery\s+address)\b"
        ],
        "explanation": "Fraudulent shipping notifications exploit common online shopping habits by demanding small customs payments to harvest credit card data.",
        "weight": 10.0
    },
    {
        "indicator": "Executive / Authority Impersonation",
        "severity": "High",
        "patterns": [
            r"\b(ceo|cfo|executive\s+vice\s+president|managing\s+director)\b",
            r"\b(it\s+helpdesk\s+(?:admin|warning)|internal\s+revenue\s+service|irs\s+notice)\b",
            r"\b(security\s+operations\s+team|compliance\s+officer|human\s+resources\s+director)\b",
            r"\b(are\s+you\s+at\s+your\s+desk\s+right\s+now|confidential\s+merger)\b"
        ],
        "explanation": "Impersonating high-ranking executives or institutional authorities intimidates lower-level staff into fulfilling anomalous requests without verification.",
        "weight": 14.0
    },
    {
        "indicator": "Suspicious Call-to-Action",
        "severity": "Medium",
        "patterns": [
            r"\b(click\s+here\s+(?:immediately|now|to\s+keep|to\s+verify|to\s+join|to\s+listen))\b",
            r"\b(download\s+(?:and\s+execute|the\s+attached|certificate\s+updater|renewal\s+patch))\b",
            r"\b(log\s+in\s+to\s+claim|sign\s+in\s+with\s+your\s+work\s+email)\b",
            r"\b(open\s+the\s+secure\s+link|decrypt\s+file)\b"
        ],
        "explanation": "High-pressure calls to action prompt users to click untrusted hyperlinks or execute unverified script payloads.",
        "weight": 10.0
    }
]

def analyze_email_content(text: str, subject: str = "") -> List[ContentIndicator]:
    combined_text = f"{subject}\n{text}".strip()
    if not combined_text:
        return []

    detected_indicators: List[ContentIndicator] = []

    for rule in CONTENT_PATTERNS:
        matched_evidences = []
        for pattern in rule["patterns"]:
            matches = re.finditer(pattern, combined_text, flags=re.IGNORECASE)
            for m in matches:
                # Capture a clean snippet around the match
                start = max(0, m.start() - 25)
                end = min(len(combined_text), m.end() + 25)
                snippet = combined_text[start:end].replace("\n", " ").strip()
                matched_evidences.append(f"...{snippet}...")
                if len(matched_evidences) >= 2:
                    break
            if matched_evidences:
                break

        if matched_evidences:
            detected_indicators.append(ContentIndicator(
                indicator=rule["indicator"],
                evidence=matched_evidences[0],
                severity=rule["severity"],
                explanation=rule["explanation"],
                score_contribution=rule["weight"]
            ))

    return detected_indicators
