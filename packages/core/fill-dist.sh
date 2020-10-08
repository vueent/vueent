#!/bin/bash

cp README.md dist && cp LICENSE dist && \
cat package.json | grep -v '"private":' | grep -v '"fill:dist"' | grep -v '"prepublishOnly"' | grep -v '"prepare"' > dist/package.json
