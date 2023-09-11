#!/bin/bash

set -eu

[[ -v EXCLUDES ]] || EXCLUDES=''

goto-root() {
  local root
  root=$(git rev-parse --show-toplevel)
  cd "$root"
}
compile() {
  goto-root
  ./compile.sh --filter "$file"
}
run() {
  goto-root
  yarn -s main "$file"
}
list() {
  goto-root
  find test -name '*.c' -print0
}
main() {
  local file
  while read -r -d $'\0' file; do
    [[ $EXCLUDES == *"${file##*/}"* ]] && continue
    diff -u "$@" <(compile) <(run)
  done < <(list)
}

main "$@"
