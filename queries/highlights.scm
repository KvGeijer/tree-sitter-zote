(line_comment) @comment

; Assume all-caps names are constants
((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]+$'"))

(call_expression function: (identifier) @function)
(pipe_expression (identifier) @function)

(function_declaration name: (_) @function)

(parameters (_) @variable.parameter)

(macro_statement name: (_) @function.macro "!" @function.macro)

(string_literal) @string

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
; "." ; This is not part of the language (floats don't use it as an unnamed field)
  ","
  ";" 
] @punctuation.delimiter

[
  "break"
  "continue"
  "else"
  "fn"
  "for"
  "if"
  "match"
  "return"
  "while"
  "and"
  "or"
] @keyword
(for_expression "in" @keyword) ; will 'for i in in' break?


[
  "="
  ":="
  "->"
  ">>"
  "\\>>"
] @operator

(boolean_literal) @constant.builtin
(integer_literal) @constant.builtin
(float_literal) @constant.builtin
(nil_literal) @constant.builtin
