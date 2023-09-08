%{
const isTypedef = (text: string): boolean => {
  return false;
};
const hexlify = (str: string): string => {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
};
const yyerror = (text: string): void => {
  console.log("unknown token:", hexlify(text));
};
%}

%lex

space                   [ \t\n\v\f]
wide_prefix             [L]?
apostrophe              [\']
quotation_mark          [\"]
backslash               [\\]
question_mark           [\?]
period                  [\.]
char_e                  [eE]
char_f                  [fF]
char_l                  [lL]
char_u                  [uU]
char_x                  [xX]
lower_x                 [x]
zero                    [0]
escape_character        [abfnrtv]
character_set           [^\'\"\\\n]

identifier              {nondigit}({nondigit}|{digit})*
nondigit                [_a-zA-Z]
digit                   [0-9]

floating_constant       ({floating_fractional}|{floating_integer}){floating_suffix}
floating_fractional     {fractional_constant}{exponent_part}?
floating_integer        {digit}+{exponent_part}
fractional_constant     {digit}+{period}{digit}*|{digit}*{period}{digit}+
exponent_part           {char_e}{sign}?{digit}+
sign                    [+-]
floating_suffix         ({char_f}|{char_l})?

integer_constant        ({decimal_constant}|{octal_constant}|{hexadecimal_constant}){integer_suffix}
decimal_constant        {nonzero_digit}{digit}*
octal_constant          {zero}{octal_digit}*
hexadecimal_constant    {zero}{char_x}{hexadecimal_digit}+
nonzero_digit           [1-9]
octal_digit             [0-7]
hexadecimal_digit       [0-9a-fA-F]
integer_suffix          {unsigned_suffix}{long_suffix}|{long_suffix}{unsigned_suffix}
unsigned_suffix         {char_u}?
long_suffix             {char_l}?

character_constant      {wide_prefix}{apostrophe}{c_char}+{apostrophe}
c_char                  {character_set}|{quotation_mark}|{escape_sequence}
escape_sequence         {simple_escape}|{octal_escape}|{hexadecimal_escape}
simple_escape           {backslash}({apostrophe}|{quotation_mark}|{question_mark}|{backslash}|{escape_character})
octal_escape            {backslash}{octal_digit}{1,3}
hexadecimal_escape      {backslash}{lower_x}{hexadecimal_digit}+

string_literal          {wide_prefix}{quotation_mark}{s_char}*{quotation_mark}
s_char                  {character_set}|{apostrophe}|{escape_sequence}

directive               [#][^\n]*

%%

{directive} { ; }
{space}     { ; }

"auto"      { return "AUTO";     }
"break"     { return "BREAK";    }
"case"      { return "CASE";     }
"char"      { return "CHAR";     }
"const"     { return "CONST";    }
"continue"  { return "CONTINUE"; }
"default"   { return "DEFAULT";  }
"do"        { return "DO";       }
"double"    { return "DOUBLE";   }
"else"      { return "ELSE";     }
"enum"      { return "ENUM";     }
"extern"    { return "EXTERN";   }
"float"     { return "FLOAT";    }
"for"       { return "FOR";      }
"goto"      { return "GOTO";     }
"if"        { return "IF";       }
"int"       { return "INT";      }
"long"      { return "LONG";     }
"register"  { return "REGISTER"; }
"return"    { return "RETURN";   }
"signed"    { return "SIGNED";   }
"sizeof"    { return "SIZEOF";   }
"short"     { return "SHORT";    }
"static"    { return "STATIC";   }
"struct"    { return "STRUCT";   }
"switch"    { return "SWITCH";   }
"typedef"   { return "TYPEDEF";  }
"union"     { return "UNION";    }
"unsigned"  { return "UNSIGNED"; }
"void"      { return "VOID";     }
"volatile"  { return "VOLATILE"; }
"while"     { return "WHILE";    }

"..."   { return "ELLIPSIS";      }
"*="    { return "ASTERISK_ASSIGN";    }
"/="    { return "SLASH_ASSIGN";       }
"%="    { return "PERCENT_ASSIGN";     }
"+="    { return "PLUS_ASSIGN";        }
"-="    { return "MINUS_ASSIGN";       }
"<<="   { return "LEFT_SHIFT_ASSIGN";  }
">>="   { return "RIGHT_SHIFT_ASSIGN"; }
"&="    { return "AMPERSAND_ASSIGN";   }
"^="    { return "CARET_ASSIGN";       }
"|="    { return "BAR_ASSIGN";         }
"->"    { return "ARROW";              }
"++"    { return "INCREMENT";          }
"--"    { return "DECREMENT";          }
"<<"    { return "LEFT_SHIFT";         }
">>"    { return "RIGHT_SHIFT";        }
"<="    { return "LESS_EQUAL";         }
">="    { return "GREATER_EQUAL";      }
"=="    { return "EQUAL";              }
"!="    { return "NOT_EQUAL";          }
"&&"    { return "AND";                }
"||"    { return "OR";                 }
"."     { return "PERIOD";             }
"&"     { return "AMPERSAND";          }
"*"     { return "ASTERISK";           }
"+"     { return "PLUS";               }
"-"     { return "MINUS";              }
"~"     { return "TILDE";              }
"!"     { return "EXCLAMATION";        }
"/"     { return "SLASH";              }
"%"     { return "PERCENT";            }
"<"     { return "LESS_THAN";          }
">"     { return "GREATER_THAN";       }
"^"     { return "CARET";              }
"|"     { return "BAR";                }
"?"     { return "QUESTION";           }
"="     { return "ASSIGN";             }
"["     { return "LEFT_BRACKET";  }
"]"     { return "RIGHT_BRACKET"; }
"("     { return "LEFT_PAREN";    }
")"     { return "RIGHT_PAREN";   }
"{"     { return "LEFT_BRACE";    }
"}"     { return "RIGHT_BRACE";   }
","     { return "COMMA";         }
":"     { return "COLON";         }
";"     { return "SEMICOLON";     }

{identifier} {
  if (isTypedef(yytext)) {
    return "TYPEDEF_IDENTIFIER";
  } else {
    return "IDENTIFIER";
  }
}
{floating_constant}     { return "FLOATING_CONSTANT";  }
{integer_constant}      { return "INTEGER_CONSTANT";   }
{character_constant}    { return "CHARACTER_CONSTANT"; }
{string_literal}        { return "STRING_LITERAL";     }
. { yyerror(yytext); }

/lex

%token AUTO BREAK CASE CHAR CONST CONTINUE DEFAULT DO DOUBLE ELSE ENUM EXTERN
%token FLOAT FOR GOTO IF INT LONG REGISTER RETURN SHORT SIGNED SIZEOF STATIC
%token STRUCT SWITCH TYPEDEF UNION UNSIGNED VOID VOLATILE WHILE
/* 6.1.2 Identifiers */
%token IDENTIFIER TYPEDEF_IDENTIFIER
/* 6.1.3 Constants */
%token FLOATING_CONSTANT INTEGER_CONSTANT CHARACTER_CONSTANT
/* 6.1.4 String literals */
%token STRING_LITERAL
/* 6.1.5 Operators */
%token PERIOD ARROW INCREMENT DECREMENT AMPERSAND ASTERISK PLUS MINUS
%token TILDE EXCLAMATION SLASH PERCENT LEFT_SHIFT RIGHT_SHIFT
%token LESS_THAN GREATER_THAN LESS_EQUAL GREATER_EQUAL EQUAL NOT_EQUAL
%token CARET BAR AND OR QUESTION
%token ASSIGN ASTERISK_ASSIGN SLASH_ASSIGN PERCENT_ASSIGN
%token PLUS_ASSIGN MINUS_ASSIGN LEFT_SHIFT_ASSIGN RIGHT_SHIFT_ASSIGN
%token AMPERSAND_ASSIGN CARET_ASSIGN BAR_ASSIGN
/* 6.1.6 Punctuators */
%token LEFT_BRACKET RIGHT_BRACKET LEFT_PAREN RIGHT_PAREN LEFT_BRACE RIGHT_BRACE
%token COMMA COLON SEMICOLON ELLIPSIS

%nonassoc THEN
%nonassoc ELSE

%start top
%%
top: translation_unit {
    return {
        type: "top",
        translation_unit: $1,
    };
}
;

auto: AUTO {
    $$ = { symbol: $1, loc: @1 };
};
break: BREAK {
    $$ = { symbol: $1, loc: @1 };
};
case: CASE {
    $$ = { symbol: $1, loc: @1 };
};
char: CHAR {
    $$ = { symbol: $1, loc: @1 };
};
const: CONST {
    $$ = { symbol: $1, loc: @1 };
};
continue: CONTINUE {
    $$ = { symbol: $1, loc: @1 };
};
default: DEFAULT {
    $$ = { symbol: $1, loc: @1 };
};
do: DO {
    $$ = { symbol: $1, loc: @1 };
};
double: DOUBLE {
    $$ = { symbol: $1, loc: @1 };
};
else: ELSE {
    $$ = { symbol: $1, loc: @1 };
};
enum: ENUM {
    $$ = { symbol: $1, loc: @1 };
};
extern: EXTERN {
    $$ = { symbol: $1, loc: @1 };
};
float: FLOAT {
    $$ = { symbol: $1, loc: @1 };
};
for: FOR {
    $$ = { symbol: $1, loc: @1 };
};
goto: GOTO {
    $$ = { symbol: $1, loc: @1 };
};
if: IF {
    $$ = { symbol: $1, loc: @1 };
};
int: INT {
    $$ = { symbol: $1, loc: @1 };
};
long: LONG {
    $$ = { symbol: $1, loc: @1 };
};
register: REGISTER {
    $$ = { symbol: $1, loc: @1 };
};
return: RETURN {
    $$ = { symbol: $1, loc: @1 };
};
short: SHORT {
    $$ = { symbol: $1, loc: @1 };
};
signed: SIGNED {
    $$ = { symbol: $1, loc: @1 };
};
sizeof: SIZEOF {
    $$ = { symbol: $1, loc: @1 };
};
static: STATIC {
    $$ = { symbol: $1, loc: @1 };
};
struct: STRUCT {
    $$ = { symbol: $1, loc: @1 };
};
switch: SWITCH {
    $$ = { symbol: $1, loc: @1 };
};
typedef: TYPEDEF {
    $$ = { symbol: $1, loc: @1 };
};
union: UNION {
    $$ = { symbol: $1, loc: @1 };
};
unsigned: UNSIGNED {
    $$ = { symbol: $1, loc: @1 };
};
void: VOID {
    $$ = { symbol: $1, loc: @1 };
};
volatile: VOLATILE {
    $$ = { symbol: $1, loc: @1 };
};
while: WHILE {
    $$ = { symbol: $1, loc: @1 };
};

period: PERIOD {
    $$ = { symbol: $1, loc: @1 };
};
arrow: ARROW {
    $$ = { symbol: $1, loc: @1 };
};
increment: INCREMENT {
    $$ = { symbol: $1, loc: @1 };
};
decrement: DECREMENT {
    $$ = { symbol: $1, loc: @1 };
};
ampersand: AMPERSAND {
    $$ = { symbol: $1, loc: @1 };
};
asterisk: ASTERISK {
    $$ = { symbol: $1, loc: @1 };
};
plus: PLUS {
    $$ = { symbol: $1, loc: @1 };
};
minus: MINUS {
    $$ = { symbol: $1, loc: @1 };
};
tilde: TILDE {
    $$ = { symbol: $1, loc: @1 };
};
exclamation: EXCLAMATION {
    $$ = { symbol: $1, loc: @1 };
};
slash: SLASH {
    $$ = { symbol: $1, loc: @1 };
};
percent: PERCENT {
    $$ = { symbol: $1, loc: @1 };
};
left_shift: LEFT_SHIFT {
    $$ = { symbol: $1, loc: @1 };
};
right_shift: RIGHT_SHIFT {
    $$ = { symbol: $1, loc: @1 };
};
less_than: LESS_THAN {
    $$ = { symbol: $1, loc: @1 };
};
greater_than: GREATER_THAN {
    $$ = { symbol: $1, loc: @1 };
};
less_equal: LESS_EQUAL {
    $$ = { symbol: $1, loc: @1 };
};
greater_equal: GREATER_EQUAL {
    $$ = { symbol: $1, loc: @1 };
};
equal: EQUAL {
    $$ = { symbol: $1, loc: @1 };
};
not_equal: NOT_EQUAL {
    $$ = { symbol: $1, loc: @1 };
};
caret: CARET {
    $$ = { symbol: $1, loc: @1 };
};
bar: BAR {
    $$ = { symbol: $1, loc: @1 };
};
and: AND {
    $$ = { symbol: $1, loc: @1 };
};
or: OR {
    $$ = { symbol: $1, loc: @1 };
};
question: QUESTION {
    $$ = { symbol: $1, loc: @1 };
};
assign: ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
asterisk_assign: ASTERISK_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
slash_assign: SLASH_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
percent_assign: PERCENT_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
plus_assign: PLUS_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
minus_assign: MINUS_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
left_shift_assign: LEFT_SHIFT_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
right_shift_assign: RIGHT_SHIFT_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
ampersand_assign: AMPERSAND_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
caret_assign: CARET_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};
bar_assign: BAR_ASSIGN {
    $$ = { symbol: $1, loc: @1 };
};

left_bracket: LEFT_BRACKET {
    $$ = { symbol: $1, loc: @1 };
};
right_bracket: RIGHT_BRACKET {
    $$ = { symbol: $1, loc: @1 };
};
left_paren: LEFT_PAREN {
    $$ = { symbol: $1, loc: @1 };
};
right_paren: RIGHT_PAREN {
    $$ = { symbol: $1, loc: @1 };
};
left_brace: LEFT_BRACE {
    $$ = { symbol: $1, loc: @1 };
};
right_brace: RIGHT_BRACE {
    $$ = { symbol: $1, loc: @1 };
};
comma: COMMA {
    $$ = { symbol: $1, loc: @1 };
};
colon: COLON {
    $$ = { symbol: $1, loc: @1 };
};
semicolon: SEMICOLON {
    $$ = { symbol: $1, loc: @1 };
};
ellipsis: ELLIPSIS {
    $$ = { symbol: $1, loc: @1 };
};

/* 6.1 Lexical elements */
identifier_opt
: /* empty */ {
    $$ = null;
}
| identifier
;
identifier
: IDENTIFIER {
    $$ = { symbol: $1, loc: @1 };
}
;

typedef_identifier
: TYPEDEF_IDENTIFIER {
    $$ = { symbol: $1, loc: @1 };
}
;

floating_constant
: FLOATING_CONSTANT {
    $$ = { symbol: $1, loc: @1 };
}
;

integer_constant
: INTEGER_CONSTANT {
    $$ = { symbol: $1, loc: @1 };
}
;

enumeration_constant
: IDENTIFIER {
    $$ = { symbol: $1, loc: @1 };
}
;

character_constant
: CHARACTER_CONSTANT {
    $$ = { symbol: $1, loc: @1 };
}
;

string_literal
: STRING_LITERAL {
    $$ = { symbol: $1, loc: @1 };
}
;

/* 6.3 Expressions */
primary_expression
: identifier {
    $$ = {
        type: "primary_expression",
        identifier: $1,
    };
}
| floating_constant {
    $$ = {
        type: "primary_expression",
        floating_constant: $1,
    };
}
| integer_constant {
    $$ = {
        type: "primary_expression",
        integer_constant: $1,
    };
}
| character_constant {
    $$ = {
        type: "primary_expression",
        character_constant: $1,
    };
}
| string_literal {
    $$ = {
        type: "primary_expression",
        string_literal: $1,
    };
}
| left_paren expression right_paren {
    $$ = {
        type: "primary_expression",
        left_paren: $1,
        expression: $2,
        right_paren: $3,
    };
}
;

postfix_expression
: primary_expression
| postfix_expression left_bracket expression right_bracket {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        left_bracket: $2,
        expression: $3,
        right_bracket: $4,
    };
}
| postfix_expression left_paren argument_expression_list_opt right_paren {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        left_paren: $2,
        argument_expression_list: $3,
        right_paren: $4,
    };
}
| postfix_expression period identifier {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        period: $2,
        identifier: $3,
    };
}
| postfix_expression arrow identifier {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        arrow: $2,
        identifier: $3,
    };
}
| postfix_expression increment {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        increment: $2,
    };
}
| postfix_expression decrement {
    $$ = {
        type: "postfix_expression",
        postfix_expression: $1,
        decrement: $2,
    };
}
;

argument_expression_list_opt
: /* empty */ {
    $$ = [];
}
| argument_expression_list
;
argument_expression_list
: assignment_expression {
    $$ = [$1];
}
| argument_expression_list comma assignment_expression {
    $$ = [...$1, $3];
}
;

unary_expression
: postfix_expression
| increment unary_expression {
    $$ = {
        type: "unary_expression",
        increment: $1,
        unary_expression: $2,
    };
}
| decrement unary_expression {
    $$ = {
        type: "unary_expression",
        decrement: $1,
        unary_expression: $2,
    };
}
| unary_operator cast_expression {
    $$ = {
        type: "unary_expression",
        unary_operator: $1,
        cast_expression: $2,
    };
}
| sizeof unary_expression {
    $$ = {
        type: "unary_expression",
        sizeof: $1,
        unary_expression: $2,
    };
}
| sizeof left_paren type_name right_paren {
    $$ = {
        type: "unary_expression",
        sizeof: $1,
        left_paren: $2,
        type_name: $3,
        right_paren: $4,
    };
}
;
unary_operator
: ampersand
| asterisk
| plus
| minus
| tilde
| exclamation
;

cast_expression
: unary_expression
| left_paren type_name right_paren cast_expression {
    $$ = {
        type: "cast_expression",
        left_paren: $1,
        type_name: $2,
        right_paren: $3,
        cast_expression: $4,
    };
}
;

multiplicative_expression
: cast_expression
| multiplicative_expression asterisk cast_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        asterisk: $2,
        right: $3,
    };
}
| multiplicative_expression slash cast_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        slash: $2,
        right: $3,
    };
}
| multiplicative_expression percent cast_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        percent: $2,
        right: $3,
    };
}
;

additive_expression
: multiplicative_expression
| additive_expression plus multiplicative_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        plus: $2,
        right: $3,
    };
}
| additive_expression minus multiplicative_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        minus: $2,
        right: $3,
    };
}
;

shift_expression
: additive_expression
| shift_expression left_shift additive_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        left_shift: $2,
        right: $3,
    };
}
| shift_expression right_shift additive_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        right_shift: $2,
        right: $3,
    };
}
;

relational_expression
: shift_expression
| relational_expression less_than shift_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        less_than: $2,
        right: $3,
    };
}
| relational_expression greater_than shift_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        greater_than: $2,
        right: $3,
    };
}
| relational_expression less_equal shift_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        less_equal: $2,
        right: $3,
    };
}
| relational_expression greater_equal shift_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        greater_equal: $2,
        right: $3,
    };
}
;

equality_expression
: relational_expression
| equality_expression equal relational_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        equal: $2,
        right: $3,
    };
}
| equality_expression not_equal relational_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        not_equal: $2,
        right: $3,
    };
}
;

and_expression
: equality_expression
| and_expression ampersand equality_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        ampersand: $2,
        right: $3,
    };
}
;

exclusive_or_expression
: and_expression
| exclusive_or_expression caret and_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        caret: $2,
        right: $3,
    };
}
;

inclusive_or_expression
: exclusive_or_expression
| inclusive_or_expression bar exclusive_or_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        bar: $2,
        right: $3,
    };
}
;

logical_and_expression
: inclusive_or_expression
| logical_and_expression and inclusive_or_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        and: $2,
        right: $3,
    };
}
;

logical_or_expression
: logical_and_expression
| logical_or_expression or logical_and_expression {
    $$ = {
        type: "binary_expression",
        left: $1,
        or: $2,
        right: $3,
    };
}
;

conditional_expression
: logical_or_expression
| logical_or_expression question expression colon conditional_expression {
    $$ = {
        type: "conditional_expression",
        condition: $1,
        question: $2,
        then: $3,
        colon: $4,
        else: $5,
    };
}
;

assignment_expression
: conditional_expression
| unary_expression assignment_operator assignment_expression {
    $$ = {
        type: "assignment_expression",
        left: $1,
        assignment_operator: $2,
        right: $3,
    };
}
;
assignment_operator
: assign
| asterisk_assign
| slash_assign
| percent_assign
| plus_assign
| minus_assign
| left_shift_assign
| right_shift_assign
| ampersand_assign
| caret_assign
| bar_assign
;

expression_opt
: /* empty */ {
    $$ = null;
}
| expression
;
expression
: assignment_expression
| expression comma assignment_expression {
    $$ = {
        type: "comma_expression",
        left: $1,
        comma: $2,
        right: $3,
    };
}
;

/* 6.4 Constant expressions */
constant_expression_opt
: /* empty */ {
    $$ = null;
}
| constant_expression
;
constant_expression
: conditional_expression
;

/* 6.5 Declarations */
declaration
: declaration_specifiers init_declarator_list_opt semicolon {
    $$ = {
        type: "declaration",
        declaration_specifiers: $1,
        init_declarator_list: $2,
        semicolon: $3,
    };
}
;

declaration_specifiers
: declaration_specifier {
    $$ = [$1];
}
| declaration_specifiers declaration_specifier {
    $$ = [...$1, $2];
}
;
declaration_specifier
: storage_class_specifier {
    $$ = {
        type: "declaration_specifier",
        storage_class_specifier: $1,
    };
}
| type_specifier {
    $$ = {
        type: "declaration_specifier",
        type_specifier: $1,
    };
}
| type_qualifier {
    $$ = {
        type: "declaration_specifier",
        type_qualifier: $1,
    };
}
;

init_declarator_list_opt
: /* empty */ {
    $$ = [];
}
| init_declarator_list
;
init_declarator_list
: init_declarator {
    $$ = [$1];
}
| init_declarator_list comma init_declarator {
    $$ = [...$1, $3];
}
;

init_declarator
: declarator {
    $$ = {
        type: "init_declarator",
        declarator: $1,
    };
}
| declarator assign initializer {
    $$ = {
        type: "init_declarator",
        declarator: $1,
        assign: $2,
        initializer: $3,
    };
}
;

storage_class_specifier
: typedef
| extern
| static
| auto
| register
;

type_specifier
: void
| char
| short
| int
| long
| float
| double
| signed
| unsigned
| struct_or_union_specifier
| enum_specifier
| typedef_name
;

struct_or_union_specifier
: struct_or_union identifier_opt left_brace struct_declaration_list right_brace {
    $$ = {
        type: "struct_or_union_specifier",
        struct_or_union: $1,
        identifier: $2,
        left_brace: $3,
        struct_declaration_list: $4,
        right_brace: $5,
    };
}
| struct_or_union identifier {
    $$ = {
        type: "struct_or_union_specifier",
        struct_or_union: $1,
        identifier: $2,
    };
}
;

struct_or_union
: struct
| union
;

struct_declaration_list
: struct_declaration {
    $$ = [$1];
}
| struct_declaration_list struct_declaration {
    $$ = [...$1, $2];
}
;

struct_declaration
: specifier_qualifier_list struct_declarator_list semicolon {
    $$ = {
        type: "struct_declaration",
        specifier_qualifier_list: $1,
        struct_declarator_list: $2,
        semicolon: $3,
    };
}
;

specifier_qualifier_list
: specifier_qualifier {
    $$ = [$1];
}
| specifier_qualifier_list specifier_qualifier {
    $$ = [...$1, $2];
}
;

specifier_qualifier
: type_specifier {
    $$ = {
        type: "specifier_qualifier",
        type_specifier: $1,
    };
}
| type_qualifier {
    $$ = {
        type: "specifier_qualifier",
        type_qualifier: $1,
    };
}
;

struct_declarator_list
: struct_declarator {
    $$ = [$1];
}
| struct_declarator_list comma struct_declarator {
    $$ = [...$1, $3];
}
;

struct_declarator
: declarator {
    $$ = {
        type: "struct_declarator",
        declarator: $1,
    };
}
| colon constant_expression {
    $$ = {
        type: "struct_declarator",
        colon: $1,
        constant_expression: $2,
    };
}
| declarator colon constant_expression {
    $$ = {
        type: "struct_declarator",
        declarator: $1,
        colon: $2,
        constant_expression: $3,
    };
}
;

enum_specifier
: enum identifier_opt left_brace enumerator_list right_brace {
    $$ = {
        type: "enum_specifier",
        enum: $1,
        identifier: $2,
        left_brace: $3,
        enumerator_list: $4,
        right_brace: $5,
    };
}
| enum identifier {
    $$ = {
        type: "enum_specifier",
        enum: $1,
        identifier: $2,
    };
}
;

enumerator_list
: enumerator {
    $$ = [$1];
}
| enumerator_list comma enumerator {
    $$ = [...$1, $3];
}
;

enumerator
: enumeration_constant {
    $$ = {
        type: "enumerator",
        enumeration_constant: $1,
    };
}
| enumeration_constant assign constant_expression {
    $$ = {
        type: "enumerator",
        enumeration_constant: $1,
        assign: $2,
        constant_expression: $3,
    };
}
;

type_qualifier
: const
| volatile
;

declarator
: direct_declarator {
    $$ = {
        type: "declarator",
        direct_declarator: $1,
    };
}
| pointer direct_declarator {
    $$ = {
        type: "declarator",
        pointer: $1,
        direct_declarator: $2,
    };
}
;

direct_declarator
: identifier {
    $$ = {
        type: "direct_declarator",
        identifier: $1,
    };
}
| left_paren declarator right_paren {
    $$ = {
        type: "direct_declarator",
        left_parent: $1,
        direct_declarator: $2,
        right_parent: $3,
    };
}
| direct_declarator left_bracket constant_expression_opt right_bracket {
    $$ = {
        type: "direct_declarator",
        direct_declarator: $1,
        left_bracket: $2,
        constant_expression: $3,
        right_bracket: $4,
    };
}
| direct_declarator left_paren parameter_type_list right_paren {
    $$ = {
        type: "direct_declarator",
        direct_declarator: $1,
        left_parent: $2,
        parameter_type_list: $3,
        right_parent: $4,
    };
}
| direct_declarator left_paren identifier_list_opt right_paren {
    $$ = {
        type: "direct_declarator",
        direct_declarator: $1,
        left_parent: $2,
        identifier_list: $3,
        right_parent: $4,
    };
}
;

pointer
: asterisk type_qualifier_list_opt {
    $$ = {
        type: "pointer",
        asterisk: $1,
        type_qualifier_list: $2,
    };
}
| pointer asterisk type_qualifier_list_opt {
    $$ = {
        type: "pointer",
        pointer: $1,
        asterisk: $2,
        type_qualifier_list: $3,
    };
}
;

type_qualifier_list_opt
: /* empty */ {
    $$ = [];
}
| type_qualifier_list
;
type_qualifier_list
: type_qualifier {
    $$ = [$1];
}
| type_qualifier_list type_qualifier {
    $$ = [...$1, $2];
}
;

parameter_type_list_opt
: /* empty */ {
    $$ = null;
}
| parameter_type_list
;
parameter_type_list
: parameter_list {
    $$ = {
        type: "parameter_type_list",
        parameter_list: $1,
    };
}
| parameter_list comma ellipsis {
    $$ = {
        type: "parameter_type_list",
        parameter_list: $1,
        comma: $2,
        ellipsis: $3,
    };
}
;
parameter_list
: parameter_declaration {
    $$ = [$1];
}
| parameter_list comma parameter_declaration {
    $$ = [...$1, $3];
}
;

parameter_declaration
: declaration_specifiers declarator {
    $$ = {
        type: "parameter_declaration",
        declaration_specifiers: $1,
        declarator: $2,
    };
}
| declaration_specifiers abstract_declarator_opt {
    $$ = {
        type: "parameter_declaration",
        declaration_specifiers: $1,
        abstract_declarator: $2,
    };
}
;

identifier_list_opt
: /* empty */ {
    $$ = [];
}
| identifier_list
;
identifier_list
: identifier {
    $$ = [$1];
}
| identifier_list comma identifier {
    $$ = [...$1, $3];
}
;

type_name
: specifier_qualifier_list abstract_declarator_opt {
    $$ = {
        type: "type_name",
        specifier_qualifier_list: $1,
        abstract_declarator: $2,
    };
}
;

abstract_declarator_opt
: /* empty */ {
    $$ = null;
}
| abstract_declarator
;
abstract_declarator
: pointer {
    $$ = {
        type: "abstract_declarator",
        pointer: $1,
    };
}
| direct_abstract_declarator {
    $$ = {
        type: "abstract_declarator",
        direct_abstract_declarator: $1,
    };
}
| pointer direct_abstract_declarator {
    $$ = {
        type: "abstract_declarator",
        pointer: $1,
        direct_abstract_declarator: $2,
    };
}
;

direct_abstract_declarator
: left_paren abstract_declarator right_paren {
    $$ = {
        type: "direct_abstract_declarator",
        left_paren: $1,
        abstract_declarator: $2,
        right_paren: $3,
    };
}
| left_bracket constant_expression_opt right_bracket {
    $$ = {
        type: "direct_abstract_declarator",
        left_bracket: $1,
        constant_expression: $2,
        right_bracket: $3,
    };
}
| direct_abstract_declarator left_bracket constant_expression_opt right_bracket {
    $$ = {
        type: "direct_abstract_declarator",
        direct_abstract_declarator: $1,
        left_bracket: $2,
        constant_expression: $3,
        right_bracket: $4,
    };
}
| left_paren parameter_type_list_opt right_paren {
    $$ = {
        type: "direct_abstract_declarator",
        left_paren: $1,
        parameter_type_list: $2,
        right_paren: $3,
    };
}
| direct_abstract_declarator left_paren parameter_type_list_opt right_paren {
    $$ = {
        type: "direct_abstract_declarator",
        direct_abstract_declarator: $1,
        left_paren: $2,
        parameter_type_list: $3,
        right_paren: $4,
    };
}
;

typedef_name
: typedef_identifier {
    $$ = {
        type: "typedef_name",
        typedef_identifier: $1,
    };
}
;

initializer
: assignment_expression
| left_brace initializer_list right_brace {
    $$ = {
        type: "initializer",
        left_brace: $1,
        initializer_list: $2,
        right_brace: $3,
    };
}
| left_brace initializer_list comma right_brace {
    $$ = {
        type: "initializer",
        left_brace: $1,
        initializer_list: $2,
        comma: $3,
        right_brace: $4,
    };
}
;

initializer_list
: initializer {
    $$ = [$1];
}
| initializer_list comma initializer {
    $$ = [...$1, $3];
}
;

/* 6.6 Statements */
statement
: labeled_statement {
    $$ = {
        type: "statement",
        labeled_statement: $1,
    };
}
| compound_statement {
    $$ = {
        type: "statement",
        compound_statement: $1,
    };
}
| expression_statement {
    $$ = {
        type: "statement",
        expression_statement: $1,
    };
}
| selection_statement {
    $$ = {
        type: "statement",
        selection_statement: $1,
    };
}
| iteration_statement {
    $$ = {
        type: "statement",
        iteration_statement: $1,
    };
}
| jump_statement {
    $$ = {
        type: "statement",
        jump_statement: $1,
    };
}
;

labeled_statement
: identifier colon statement {
    $$ = {
        type: "labeled_statement",
        identifier: $1,
        colon: $2,
        statement: $3,
    };
}
| case constant_expression colon statement {
    $$ = {
        type: "labeled_statement",
        case: $1,
        constant_expression: $2,
        colon: $3,
        statement: $4,
    };
}
| default colon statement {
    $$ = {
        type: "labeled_statement",
        default: $1,
        colon: $2,
        statement: $3,
    };
}
;

compound_statement
: left_brace declaration_list_opt statement_list_opt right_brace {
    $$ = {
        type: "compound_statement",
        left_brace: $1,
        declaration_list: $2,
        statement_list: $3,
        right_brace: $4,
    };
}
;

declaration_list_opt
: /* empty */ {
    $$ = [];
}
| declaration_list
;
declaration_list
: declaration {
    $$ = [$1];
}
| declaration_list declaration {
    $$ = [...$1, $2];
}
;

statement_list_opt
: /* empty */ {
    $$ = [];
}
| statement_list
;
statement_list
: statement {
    $$ = [$1];
}
| statement_list statement {
    $$ = [...$1, $2];
}
;

expression_statement
: semicolon {
    $$ = {
        type: "expression_statement",
        semicolon: $1,
    };
}
| expression semicolon {
    $$ = {
        type: "expression_statement",
        expression: $1,
        semicolon: $2,
    };
}
;

selection_statement
: if left_paren expression right_paren statement %prec THEN {
    $$ = {
        type: "selection_statement",
        if: $1,
        left_paren: $2,
        expression: $3,
        right_paren: $4,
        then_statement: $5,
    };
}
| if left_paren expression right_paren statement else statement {
    $$ = {
        type: "selection_statement",
        if: $1,
        left_paren: $2,
        expression: $3,
        right_paren: $4,
        then_statement: $5,
        else: $6,
        else_statement: $7,
    };
}
| switch left_paren expression right_paren statement {
    $$ = {
        type: "selection_statement",
        switch: $1,
        left_paren: $2,
        expression: $3,
        right_paren: $4,
        statement: $5,
    };
}
;

iteration_statement
: while left_paren expression right_paren statement {
    $$ = {
        type: "iteration_statement",
        while: $1,
        left_paren: $2,
        expression: $3,
        right_paren: $4,
        statement: $5,
    };
}
| do statement while left_paren expression right_paren semicolon {
    $$ = {
        type: "iteration_statement",
        do: $1,
        statement: $2,
        while: $3,
        left_paren: $4,
        expression: $5,
        right_paren: $6,
        semicolon: $7,
    };
}
| for left_paren expression_opt semicolon expression_opt semicolon expression_opt right_paren statement {
    $$ = {
        type: "iteration_statement",
        for: $1,
        left_paren: $2,
        init_expression: $3,
        init_semicolon: $4,
        cond_expression: $5,
        cond_semicolon: $6,
        next_expression: $7,
        right_paren: $8,
        statement: $9,
    };
}
;

jump_statement
: goto identifier semicolon {
    $$ = {
        type: "jump_statement",
        goto: $1,
        identifier: $2,
        semicolon: $3,
    };
}
| continue semicolon {
    $$ = {
        type: "jump_statement",
        continue: $1,
        semicolon: $2,
    };
}
| break semicolon {
    $$ = {
        type: "jump_statement",
        break: $1,
        semicolon: $2,
    };
}
| return expression_opt semicolon {
    $$ = {
        type: "jump_statement",
        return: $1,
        expression: $2,
        semicolon: $3,
    };
}
;

/* 6.7 External definitions */
translation_unit
: external_declaration {
    $$ = [$1];
}
| translation_unit external_declaration {
    $$ = [...$1, $2];
}
;

external_declaration
: function_definition
| declaration {
    $$ = {
        type: "external_declaration",
        declaration: $1,
    };
}
;

function_definition
: declarator declaration_list_opt compound_statement {
    $$ = {
        type: "function_definition",
        declarator: $1,
        declaration_list: $2,
        compound_statement: $3,
    };
}
| declaration_specifiers declarator declaration_list_opt compound_statement {
    $$ = {
        type: "function_definition",
        declaration_specifiers: $1,
        declarator: $2,
        declaration_list: $3,
        compound_statement: $4,
    };
}
;
