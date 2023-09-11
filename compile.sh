#!/bin/bash

set -eu

usage() {
  cat <<EOF >&2
USAGE: $0 [--filter] [OPTIONS] FILE
  compile FILE into LLVM IR and print it to stdout
  extraneous information can be filtered out from the output

  --filter  filter out comments, attributes, metadata, and empty lines
  OPTIONS   options passed to clang
  FILE      file to compile
EOF
  exit
}

emit() {
  local target=x86_64-unknown-linux-gnu
  clang -O0 -S -emit-llvm -target $target -o - "$@"
}
filter() {
  local scripts=(
    -e 's/;.*$//'
    -e '/^!/d'
    -e '/^attributes /d'
    -e 's/#[0-9]\+ //g'
    -e '/^[ ]*$/d'
  )
  sed "${scripts[@]}"
}
main() {
  local arg file filter=cat
  local -a opts
  for arg; do
    if [[ $arg == --filter ]]; then
      filter=filter
      continue
    fi
    opts+=("$arg")
    if [[ $arg == !(-)*.c ]]; then
      [[ -v file ]] && usage
      file=$arg
    fi
  done
  [[ -v file ]] || usage
  emit "${opts[@]}" | $filter -
}

main "$@"
