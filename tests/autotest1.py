#!/usr/bin/env python3
import requests
import sys
import os

print("start checking response to request with invalid host header")
try:
    response = requests.get("https://db.drunkbatya.com", headers = {"host": "WRONG_HOST"}, timeout = 1)
    print(Test n1 crashed)
    sys.exit(1)
except requests.exceptions.ReadTimeout:
    next

credentials = {
        "username": os.getenv("secrets.WEBUI_TESTING_LOGIN"),
    "password": os.getenv("WEBUI_TESTING_PASS")
     }

print("start checking the principle of issuing cookies")
response = requests.post("https://db.drunkbatya.com/server/login", data = {"secrets.WEBUI_TESTING_LOGIN", "WEBUI_TESTING_PASS"})

if "egoSession" in response.cookies:
    next
else:
    print(Test n2 crashed)
    sys.exit(1)


