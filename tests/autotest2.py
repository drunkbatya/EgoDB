#!/usr/bin/env python3
import requests
r=requests.post("https://db.drunkbatya.com/login", body = {username: "admin", password: "pass"})


