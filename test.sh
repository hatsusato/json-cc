#!/bin/bash

compare() {
  diff -u <(./compile.sh "$@") <(yarn -s main "$@")
}
foreach() {
  local f
  while read f; do
    "$@" "$f"
  done < <(find tests -name '*.c')
}

if [[ $1 == -l ]]; then
  foreach ./compile.sh
else
  foreach compare
fi
