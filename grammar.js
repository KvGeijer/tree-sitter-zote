// Adapted from https://github.com/tree-sitter/tree-sitter-rust/blob/master/grammar.js#L16
const PREC = {
  unary: 12,
  exponential: 11,
  multiplicative: 10,
  additive: 9,
  comparative: 4,
  and: 3,
  or: 2,
};

module.exports = grammar({
  name: 'Zote',

  rules: {
    source_file: $ => repeat(seq($._statement, optional(repeat(';')))),

    _statement: $ =>  choice(
      $.expression_statement,
      // TODO: Add declarations
    ),

    expression_statement: $ => choice(
      seq($._expression, ';'),
      // $._expression_ending_with_block,
    ),

    _expression: $ => choice(
      $.binary_expression,
      $._literal,
      $.identifier,
      $.block,
      $.if_expression,
      $.for_expression,
      $.while_expression,
      $.match_expression,

      // TODO: more
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $._expression),
      optional(seq('else', field('alternative', $._expression))),
    )),    

    for_expression: $ => seq(
      'for',
      field('pattern', $._pattern),
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
      field('pattern', $._pattern),
      '->',
      choice(
        seq(field('value', $._expression), ','),
        // field('value', prec(1, $._expression_ending_with_block)),
      ),
    )),

    last_match_arm: $ => seq(
      field('pattern', $._pattern),
      '->',
      field('value', $._expression),
      optional(','),
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}'
    ),

    // _expression_ending_with_block: $ => choice(
    //   $.block,
    //   $.if_expression_ending_with_block,
    //   $.for_expression_ending_with_block,
    //   $.while_expression_ending_with_block,
    //   $.match_expression,
    // ),


    // if_expression_ending_with_block: $ => seq(

    // ),
    
    // for_expression_ending_with_block: $ => seq(
      
    // ),
    
    // while_expression_ending_with_block: $ => seq(
      
    // ),

    // Adapted from https://github.com/tree-sitter/tree-sitter-rust/blob/master/grammar.js#L1017
    binary_expression: $ => {
      const table = [
        [PREC.and, '&&'],
        [PREC.or, '||'],
        [PREC.exponential, '^'],
        [PREC.comparative, choice('==', '!=', '<', '<=', '>', '>=')],
        [PREC.additive, choice('+', '-')],
        [PREC.multiplicative, choice('*', '/', '%')],
      ];

      // @ts-ignore
      return choice(...table.map(([precedence, operator]) => prec.left(precedence, seq(
        field('left', $._expression),
        // @ts-ignore
        field('operator', operator),
        field('right', $._expression),
      ))));
    },

    _pattern: $ => choice(
      $.identifier,
      $._literal,
      $.par_pattern,
    ),
    
    par_pattern: $ => seq(
      '(',
      optional(seq(
        repeat(seq($._pattern, ',')),
        $._pattern,
      )),
      ')'
    ),
    
    _literal: $ => choice(
      $.string_literal,
      $.boolean_literal,
      $.integer_literal,
      $.float_literal,
      $.nil_literal,
    ),

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
      token(/".*?"/),
      token(/'.*?'/)
    ),

    nil_literal: $ => token(
      /nil/
    ),

    identifier: $ => token(
      /[\w--\d]\w*/
    ),
  }
});

