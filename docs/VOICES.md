# Warm voices for Portuguese and Kiswahili

Lamora speaks every Portuguese (Portugal) and Kiswahili word. The best
results come from natural **neural** voices, generated once and shipped inside
the app, so children's devices never contact any service and everything
works offline.

| Language | Voice | Accent |
| --- | --- | --- |
| Português (Portugal) | Microsoft Azure **Raquel** (`pt-PT-RaquelNeural`) | European Portuguese, female |
| Kiswahili | Microsoft Azure **Zuri** (`sw-KE-ZuriNeural`) | Kenyan Swahili, female |

Until this is set up, the app uses its built-in open-source voice (eSpeak NG),
which is accurate but sounds robotic.

## One-time setup (about 10 minutes, free)

1. **Create a free Azure Speech resource**
   - Go to <https://portal.azure.com> and sign in (a free Microsoft account works).
   - **Create a resource** → search **Speech** → **Create**.
   - Pricing tier: **Free F0**. Region: **West Europe** (any region works).
   - When it's created, open it → **Keys and Endpoint** → copy **KEY 1** and the **Location/Region** (e.g. `westeurope`).

   The free tier includes 500,000 characters of neural speech per month;
   generating all of Lamora's words uses about 3,000.

2. **Add two secrets to the GitHub repository**
   GitHub → **Settings → Secrets and variables → Actions → New repository secret**

   | Name | Value |
   | --- | --- |
   | `AZURE_SPEECH_KEY` | KEY 1 from step 1 |
   | `AZURE_SPEECH_REGION` | the region, e.g. `westeurope` |

3. **Generate the voices**
   GitHub → **Actions → Language voices → Run workflow**.
   In about two minutes it creates all 220 clips, commits them, and starts a
   new Android build. The website updates automatically.

After that, the voices regenerate by themselves whenever the word list
(`src/data/languages.ts`) changes.

## Other ways to make it sound like family

- **Record words yourself:** Parent Zone → Languages → **Record words**. A
  family member's recording always takes priority over every other voice.
  Recordings stay on the device.
- **Device voices:** if the built-in clips are still the robotic ones, Lamora
  uses a European Portuguese voice installed on the device instead. On iPad:
  Settings → Accessibility → Spoken Content → Voices → Portuguese (Portugal) →
  download **Joana (Enhanced)** or **Catarina (Premium)**. A Brazilian voice is
  never used.

## Generating locally

```bash
AZURE_SPEECH_KEY=… AZURE_SPEECH_REGION=westeurope npm run voices
```

Optional: `AZURE_VOICE_PT=pt-PT-FernandaNeural` or
`AZURE_VOICE_SW=sw-TZ-RehemaNeural` (Tanzanian Swahili) to choose other voices.
