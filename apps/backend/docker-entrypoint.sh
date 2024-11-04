#!/bin/sh

socat TCP-LISTEN:3307,fork TCP:database:3307 &

pnpm -F @cirrodrive/backend run db:push
pnpm -F @cirrodrive/backend run start
