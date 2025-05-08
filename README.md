# User-installable Discord Bot
This is a very basic user-installable Discord bot with an AI-based chatbot command.

# Running
1. Prerequisites
    * Install the `nodejs`, `npm`, `typescript`, and `make` packages:
        * On Arch-based distributions: `pacman -Syu nodejs npm typescript make`
        * On other distributions, use your distribution's package manager to install `nodejs`, `npm`, and `make`, then run `npm install -g typescript`
        * On w*ndows, you can install the needed applications from their respective websites:
            * [Node.js](https://nodejs.org/en/download) (Ships with `node` and `npm`)
            * [Make](https://gnuwin32.sourceforge.net/packages/make.htm)
            * Typescript: `npm install -g typescript`
    * Set up the .env
        * Fill in INIT_AI (The inital system prompt for the AI model, this one is optional but recommended)
        * Open the [Discord Developer Portal](https://discord.dev)
        * Fill in TOKEN using your Discord bot's token, found under the Bot category
        * Fill in CLIENT_ID using your Discord bot's client id, found under the OAuth2 category
        * Open [GroqCloud's official website](https://console.groq.com), make an account if you do not already have one, then log in
        * Fill in API_KEY using your [GroqCloud API key](https://console.groq.com/keys)

2. Compile and Run
    * On UNIX/UNIX-like systems, you can simply run `make`, the Makefile will handle everything for you.
    * If the Makefile doesn't work, you can compile and run it yourself with these commands
        * `mkdir dist`
        * `tsc --outDir dist --target ES2021 --module commonjs`
        * `node dist/Index.js` Use `node dist\Index.js` on w*ndows
        * (UNTESTED, PLEASE [OPEN AN ISSUE](https://github.com/DiamantOpp/discordjs-userinstall/issues/new) IF THIS DOES NOT WORK)