; scopes (TODO)
(block) @local.scope
(function_declaration) @local.scope
(lambda_expression) @local.scope
(match_arm) @local.scope
(for_expression) @local.scope

; Declaration targets (all children through patterns of some nodes are declarations)
; (parameters [(par_pattern) (identifier)] @declaration_target)
; (variable_declaration [(par_pattern) (identifier)] @declaration_target)
; ((par_pattern [(par_pattern) (identifier)] @declaration_target) (#is declaration_target)
; (match_arm [(par_pattern) (identifier)] @declaration_target)

; Declarations
(parameters (identifier) @local.definition)
(variable_declaration (identifier) @local.definition)
(match_arm (identifier) @local.definiton)
(function_declaration . (identifier) @local.definition)
(for_expression pattern: (identifier) @local.definition)
(par_pattern_decl (identifier) @local.definition)

(identifier) @local.reference
