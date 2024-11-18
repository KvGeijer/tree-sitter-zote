(line_comment) @comment

; Assume all-caps names are constants
((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))

(call_expression function: (identifier) @function)
(pipe_expression (identifier) @function . )


(assign_expression (identifier) @function (lambda_expression))
(assign_expression (identifier) @function (init_pipe_expression))
(variable_declaration (identifier) @function (lambda_expression))
(variable_declaration (identifier) @function (init_pipe_expression))
(function_declaration name: (_) @function)

(parameters (_) @variable.parameter)

; Simply treat all other unknown identifiers as variables
((identifier) @variable)


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
  "=="
  "!="
  ">"
  "<"
  "<="
  ">="
  "+="
  "-="
  "/="
  "*="
  "++="
  "+"
  "-"
  "/"
  "*"
  "++"

] @operator

(boolean_literal) @constant.builtin
(integer_literal) @constant.builtin
(float_literal) @constant.builtin
(nil_literal) @constant.builtin
