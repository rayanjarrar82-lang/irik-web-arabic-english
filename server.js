const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.post("/api/apply", async (req, res) => {
  try {
    const body = req.body || {};
    const required = ["position", "discord", "minecraft", "age", "why", "experience"];

    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return res.status(400).json({ error: "Please complete all required fields." });
      }
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      return res.status(500).json({ error: "Discord webhook is not configured." });
    }

    const safe = (v) => String(v ?? "").slice(0, 1000);

    const payload = {
      username: "IRIK Network Applications",
      embeds: [{
        title: "📩 New Staff Application",
        color: 0x6D5DF5,
        fields: [
          { name: "Position", value: safe(body.position), inline: true },
          { name: "Discord", value: safe(body.discord), inline: true },
          { name: "Minecraft", value: safe(body.minecraft), inline: true },
          { name: "Age", value: safe(body.age), inline: true },
          { name: "Why do you want to join?", value: safe(body.why) },
          { name: "Previous experience", value: safe(body.experience) },
          { name: "Anything else", value: safe(body.extra || "None") }
        ],
        footer: { text: "IRIK Network Recruitment" },
        timestamp: new Date().toISOString()
      }]
    };

    const discord = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!discord.ok) {
      return res.status(502).json({ error: "Discord rejected the application." });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IRIK Network running on port ${PORT}`);
});
