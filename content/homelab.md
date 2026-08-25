---
title: "Homelab"
description: "One repository that runs the whole house: Proxmox, OpenTofu, Docker stacks, Traefik, Authentik, Vault, and monitoring as code."
type: "homelab"
aliases: ["/projects/"]
---

Everything I run at home lives in one repository. Not a folder of compose files I edit over SSH and forget about — modules, pinned versions, runbooks, and a review step. If it isn't in git, it isn't in the lab.

The rule I hold myself to is that I should be able to lose any box and rebuild it from the repo. That's why the router config, the identity provider, the dashboards and the alert rules are all code. The interesting part isn't the list of services; it's that almost nothing in it was set up by clicking.

It's also where I get to make the mistakes I don't want to make at work. When I moved monitoring to config-as-code, my first alert rule fed a `== 0` expression into a `> 0` threshold — so a dead service produced a `0` that never crossed the line and the rule sat there looking healthy. I found it by stopping Sonarr and watching the probe read zero for several minutes while nothing fired. Both rules now threshold the raw metric, and I verified the full cycle: stop the service, alert fires, start it, alert resolves.
