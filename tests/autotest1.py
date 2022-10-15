#!/usr/bin/env python3

# copyright 2022

import requests
import time
import sys

print("starting...")
try:
    response = requests.get("https://db.drunkbatya.com", headers = {'host': 'db.dunkbatya.com'}, timeout = 1)
    sys.exit(1)
except requests.exceptions.ReadTimeout:
    sys.exit(0)

