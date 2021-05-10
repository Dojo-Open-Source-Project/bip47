#!/bin/sh
cat >$(pwd)/dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >$(pwd)/dist/esm/package.json <<!EOF
{
    "type": "module"
}
!EOF
