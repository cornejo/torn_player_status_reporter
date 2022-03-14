# Torn Player Status Reporter

This script reports the state of any player you are actively looking at to rDacted's server.

It's a Torn-legal way of obtaining the current state of any player without spamming the torn servers.

Here's how it works:

- The faction identifies targets of interest (a warring faction for example)
- Member of this faction use this script and open their web browsers to view the state of each target
- This script then reports changes to the target's status (Okay, in hospital, etc) as it happens.
- The change is reported to a server, which then broadcasts it to a discord server
- Everyone becomes aware of the target's state via the discord server

This script relies on there being enough users to monitor the targeted people - but doesn't require everyone to be monitoring.

# Installation

With your web browser, install the TamperMonkey extension (or equivalent - eg GreaseMonkey)

Browse to: TODO

The script is now installed

# BUGS

- GM_xmlhttpRequest seems to fail randomly. It may be cache related, or it might be related to browser restrictions. Disabling "Shields" on Brave seems to have fixed it (?)

