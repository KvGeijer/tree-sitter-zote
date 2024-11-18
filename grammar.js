// Adapted from https://github.com/tree-sitter/tree-sitter-rust/blob/master/grammar.js#L16
const PREC = {
  nonempty_range: 101,
  range:100,
  block_ending: 20,
  call: 15,
  unary: 12,
  exponential: 11,
  multiplicative: 10,
  additive: 9,
  comparative: 4,
  and: 3,
  or: 2,
  pipe: 1,
  init_pipe: 0,
  list: -1,
};

module.exports = grammar({
  name: 'zote',

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  rules: {
    source_file: $ => repeat(seq($._statement, optional(repeat(';')))),


    _statement: $ =>  choice(
      $.expression_statement,
      $._declaration_statement,
      $.macro_statement,
      // TODO: Add declarations
    ),

    macro_statement: $ => seq(
      field("name", $.identifier),
      token.immediate('!'),
      field('arguments', $.arguments),
      ';'
    ),

    _declaration_statement: $ => choice(
      $.function_declaration,
      $.variable_declaration,
    ),

    variable_declaration: $ => seq(
      field('decl', $._pattern_decl),
      ':=',
      $._expression,
      ';'
    ),

    function_declaration: $ => seq(
      'fn',
      field('name', $.identifier),
      field('parameters', $.parameters),
      '->',
      
      field('body', 
        choice(
          $._expression_ending_with_block,
          seq($._expression, ';'),
        )
      ),
    ),

    parameters: $ => seq(
      '(',
      sepBy(',', $._pattern_decl),
      ')',
    ),

    expression_statement: $ => choice(
      seq($._expression, ';'),
      $._expression_ending_with_block,
    ),

    _expression: $ => choice(
      $.group_expression,
      $.call_expression,
      $.binary_expression,
      $.unary_expression,
      $._literal,
      $.identifier,
      $.block,
      $.if_expression,
      $.for_expression,
      $.while_expression,
      $.match_expression,
      $.list_expression,
      $.list_comp_expression,
      $.index_expression,
      $.assign_expression,
      $.modify_assign_expression,
      $.break_expression,
      $.continue_expression,
      $.return_expression,
      $.lambda_expression,
      $.pipe_expression,
      $.init_pipe_expression,
    ),

    group_expression: $ => seq(
      '(',
      $._expression,
      ')'
    ),

    lambda_expression: $ => seq(
      '\\',
      alias(sepBy(',', $._pattern_decl), $.parameters),
      '->',
      $._expression,
    ),
    
    return_expression: $ => choice(
      prec.left(seq('return', $._expression)),
      prec(-1, 'return'),
    ),
    
    break_expression: $ => prec.left('break'),
    continue_expression: $ => prec.left('continue'),
    
    modify_assign_expression: $ => seq(
      field('lvalue', choice($.identifier, $.index_pattern)),
      field('operator', choice('+=', '++=', '-=', '*=', '/=', '%=', '^=', 'or=', 'and=')),
      field('rvalue', $._expression),
    ),

    assign_expression: $ => seq(
      $._pattern,
      '=',
      $._expression,
    ),

    index_expression: $ => prec(PREC.call, seq(
      $._expression, 
      $._index
    )),

    _non_immediate_index: $ => seq(
      '[', 
      choice(
        $.single_index,
        $.range_index,
      ),
      ']'
    ),
    
    _index: $ => seq(
      token.immediate('['), 
      choice(
        $.single_index,
        $.range_index,
      ),
      ']'
    ),

    single_index: $ => $._expression,

    range_index: $ => prec.left(PREC.range, seq(
      optional($._expression),
      ':',
      optional($._expression),
      optional(choice(
        seq(':', optional($._expression)),
        ':'
      )),
    )),

    nonempty_range_index: $ => prec.left(PREC.nonempty_range, seq(
      $._expression,
      ':',
      $._expression,
      optional(seq(':', optional($._expression))),
    )),
    
    call_expression: $ => prec(PREC.call, seq(
      field('function', $._expression),
      field('arguments', $.arguments),
    )),    

    arguments: $ => seq(
      token.immediate('('),
      sepBy(',', $._expression),
      optional(','),
      ')',
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $._expression),
      optional(seq('else', field('alternative', $._expression))),
    )),    

    for_expression: $ => seq(
      'for',
      field('pattern', $._pattern_decl),
      'in',
      field('value', $._expression),
      field('body', $._expression),
    ),    
      
    while_expression: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $._expression),
    ),
    
    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      field('body', $.match_block),
    ),

    match_block: $ => seq(
      '{',
      optional(seq(
        repeat($.match_arm),
        alias($.last_match_arm, $.match_arm),
      )),
      '}',
    ),

    match_arm: $ => prec.right(seq(
      field('pattern', $._pattern_decl),
      '->',
      choice(
        seq(field('value', $._expression), ','),
        field('value', prec(1, $._expression_ending_with_block)),
      ),
    )),

    last_match_arm: $ => seq(
      field('pattern', $._pattern_decl),
      '->',
      field('value', $._expression),
      optional(','),
    ),

    block: $ => seq(
      '{',
      optional(seq(
        repeat($._statement),
        choice(
          $._statement,
          $._expression,
        ),
      )),
      '}'
    ),

    _expression_ending_with_block: $ => prec(PREC.block_ending, choice(
      $.block,
      alias($.if_expression_ending_with_block, $.if_expression),
      alias($.for_expression_ending_with_block, $.for_expression),
      alias($.while_expression_ending_with_block, $.while_expression),
      $.match_expression,
    )),


    if_expression_ending_with_block: $ => prec.right(choice(
        seq(
          'if',
          field('condition', $._expression),
          field('consequence', $._expression_ending_with_block),
        ),
        seq(
          'if',
          field('condition', $._expression),
          field('consequence', $._expression),
          'else',
          field('alternative', $._expression_ending_with_block),
        ),
    )),    
    
    for_expression_ending_with_block: $ => seq(
      'for',
      field('pattern', $._pattern_decl),
      'in',
      field('value', $._expression),
      field('body', $._expression_ending_with_block),
      
    ),
    
    while_expression_ending_with_block: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $._expression_ending_with_block),
    ),

    list_expression: $ => prec.left(PREC.list, seq(
      '[',
      seq(
        sepBy(',', $._expression),
        optional(','),
      ),
      ']',
    )),

    list_comp_expression: $ => prec.left(PREC.list, seq(
      '[',
      $.nonempty_range_index,
      ']',
    )),

    pipe_expression: $ => prec.left(PREC.pipe, seq(
      $._expression,
      '>>',
      choice($._expression, $._non_immediate_index)
    )),
    
    init_pipe_expression: $ => prec.left(seq(
      '\\>>',
      choice($._expression, $._non_immediate_index)
    )),
    
    // TODO: Pipes are not binary expressions, as they can take
    // a slice to the right, and not a real expression.
    binary_expression: $ => {
      const table = [
        [prec.left, PREC.and, 'and'],
        [prec.left, PREC.or, 'or'],
        [prec.left, PREC.exponential, '^'],
        [prec.left, PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
        [prec.left, PREC.additive, choice('+', '-', '++')],
        [prec.left, PREC.multiplicative, choice('*', '/', '%')],
      ];

      // @ts-ignore
      return choice(...table.map(([dir, precedence, operator]) => dir(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      ))));
    },

    unary_expression: $ => {
      const table = [
        [PREC.unary, choice('-', '!')],
      ];

      // @ts-ignore
      return choice(...table.map(([precedence, operator]) => prec.left(precedence, seq(
        field('operator', operator),
        field('right', $._expression),
      ))));
    },

    _pattern: $ => choice(
      $.identifier,
      choice($._literal, $.neg_pattern),
      $.par_pattern,
      $.index_pattern,
    ),

    _pattern_decl: $ => choice(
      $.identifier,
      $._literal, 
      $.neg_pattern,
      $.par_pattern_decl,
    ),

    index_pattern: $ => prec(PREC.call, seq(
      $._expression, 
      $._index
    )),
    
    // Not optimal... 
    par_pattern: $ => seq(
      '(',
      sepBy2(',', $._pattern),
      ')'
    ),
    
    par_pattern_decl: $ => seq(
      '(',
      sepBy2(',', $._pattern_decl),
      ')'
    ),
    
    _literal: $ => choice(
      $.string_literal,
      $.boolean_literal,
      $.integer_literal,
      $.float_literal,
      $.nil_literal,
    ),

    neg_pattern: $ => prec(PREC.unary, seq(
      '-',
      choice($.integer_literal, $.float_literal),
    )),

    integer_literal: _ => token(
        /0|([1-9][0-9]*)/
    ),

    float_literal: _ => token(
      /(([1-9]\d*\.\d+)|(0\.\d+))/
    ),

    boolean_literal: _ => token(
      /true|false/
    ),

    string_literal: $ => choice(
      token(/"[^"]*?"/),
      token(/'[^']*?'/)
    ),

    nil_literal: $ => token(
      /nil/
    ),

    identifier: $ => token(
      /[\w--\d]\w*/
    ),

    line_comment: _ => token(seq(
      '//', /.*/,
    )),
  },

  conflicts: ($) => [
    // These are essentially parsed the same, and separated for queries
    [$._pattern, $._pattern_decl],
  ],
});

/**
 * Creates a rule to match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
function sepBy2(sep, rule) {
  return seq(rule, sep, rule, repeat(seq(sep, rule)));
}

/**
 * Creates a rule to match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}


/**
 * Creates a rule to optionally match one or more of the rules separated by the separator.
 *
 * @param {RuleOrLiteral} sep - The separator to use.
 * @param {RuleOrLiteral} rule
 *
 * @return {ChoiceRule}
 *
 */
function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
