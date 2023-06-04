%{
import {
  addOperator,
  isTypedef,
  newAst,
  newList,
  newToken,
  yyerror,
} from "../src/ast";
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
floating_suffix         {char_f}?|{char_l}?

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

"."     { return "PERIOD";             }
"->"    { return "ARROW";              }
"++"    { return "INCREMENT";          }
"--"    { return "DECREMENT";          }
"&"     { return "AMPERSAND";          }
"*"     { return "ASTERISK";           }
"+"     { return "PLUS";               }
"-"     { return "MINUS";              }
"~"     { return "TILDE";              }
"!"     { return "EXCLAMATION";        }
"/"     { return "SLASH";              }
"%"     { return "PERCENT";            }
"<<"    { return "LEFT_SHIFT";         }
">>"    { return "RIGHT_SHIFT";        }
"<"     { return "LESS_THAN";          }
">"     { return "GREATER_THAN";       }
"<="    { return "LESS_EQUAL";         }
">="    { return "GREATER_EQUAL";      }
"=="    { return "EQUAL";              }
"!="    { return "NOT_EQUAL";          }
"^"     { return "CARET";              }
"|"     { return "BAR";                }
"&&"    { return "AND";                }
"||"    { return "OR";                 }
"?"     { return "QUESTION";           }
"="     { return "ASSIGN";             }
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

"["     { return "LEFT_BRACKET";  }
"]"     { return "RIGHT_BRACKET"; }
"("     { return "LEFT_PAREN";    }
")"     { return "RIGHT_PAREN";   }
"{"     { return "LEFT_BRACE";    }
"}"     { return "RIGHT_BRACE";   }
","     { return "COMMA";         }
":"     { return "COLON";         }
";"     { return "SEMICOLON";     }
"..."   { return "ELLIPSIS";      }

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
top: translation_unit { return $1; }
;

auto: AUTO { $$ = newToken($1, @1); };
break: BREAK { $$ = newToken($1, @1); };
case: CASE { $$ = newToken($1, @1); };
char: CHAR { $$ = newToken($1, @1); };
const: CONST { $$ = newToken($1, @1); };
continue: CONTINUE { $$ = newToken($1, @1); };
default: DEFAULT { $$ = newToken($1, @1); };
do: DO { $$ = newToken($1, @1); };
double: DOUBLE { $$ = newToken($1, @1); };
else: ELSE { $$ = newToken($1, @1); };
enum: ENUM { $$ = newToken($1, @1); };
extern: EXTERN { $$ = newToken($1, @1); };
float: FLOAT { $$ = newToken($1, @1); };
for: FOR { $$ = newToken($1, @1); };
goto: GOTO { $$ = newToken($1, @1); };
if: IF { $$ = newToken($1, @1); };
int: INT { $$ = newToken($1, @1); };
long: LONG { $$ = newToken($1, @1); };
register: REGISTER { $$ = newToken($1, @1); };
return: RETURN { $$ = newToken($1, @1); };
short: SHORT { $$ = newToken($1, @1); };
signed: SIGNED { $$ = newToken($1, @1); };
sizeof: SIZEOF { $$ = newToken($1, @1); };
static: STATIC { $$ = newToken($1, @1); };
struct: STRUCT { $$ = newToken($1, @1); };
switch: SWITCH { $$ = newToken($1, @1); };
typedef: TYPEDEF { $$ = newToken($1, @1); };
union: UNION { $$ = newToken($1, @1); };
unsigned: UNSIGNED { $$ = newToken($1, @1); };
void: VOID { $$ = newToken($1, @1); };
volatile: VOLATILE { $$ = newToken($1, @1); };
while: WHILE { $$ = newToken($1, @1); };

period: PERIOD { $$ = newToken($1, @1); };
arrow: ARROW { $$ = newToken($1, @1); };
increment: INCREMENT { $$ = newToken($1, @1); };
decrement: DECREMENT { $$ = newToken($1, @1); };
ampersand: AMPERSAND { $$ = newToken($1, @1); };
asterisk: ASTERISK { $$ = newToken($1, @1); };
plus: PLUS { $$ = newToken($1, @1); };
minus: MINUS { $$ = newToken($1, @1); };
tilde: TILDE { $$ = newToken($1, @1); };
exclamation: EXCLAMATION { $$ = newToken($1, @1); };
slash: SLASH { $$ = newToken($1, @1); };
percent: PERCENT { $$ = newToken($1, @1); };
left_shift: LEFT_SHIFT { $$ = newToken($1, @1); };
right_shift: RIGHT_SHIFT { $$ = newToken($1, @1); };
less_than: LESS_THAN { $$ = newToken($1, @1); };
greater_than: GREATER_THAN { $$ = newToken($1, @1); };
less_equal: LESS_EQUAL { $$ = newToken($1, @1); };
greater_equal: GREATER_EQUAL { $$ = newToken($1, @1); };
equal: EQUAL { $$ = newToken($1, @1); };
not_equal: NOT_EQUAL { $$ = newToken($1, @1); };
caret: CARET { $$ = newToken($1, @1); };
bar: BAR { $$ = newToken($1, @1); };
and: AND { $$ = newToken($1, @1); };
or: OR { $$ = newToken($1, @1); };
question: QUESTION { $$ = newToken($1, @1); };
assign: ASSIGN { $$ = newToken($1, @1); };
asterisk_assign: ASTERISK_ASSIGN { $$ = newToken($1, @1); };
slash_assign: SLASH_ASSIGN { $$ = newToken($1, @1); };
percent_assign: PERCENT_ASSIGN { $$ = newToken($1, @1); };
plus_assign: PLUS_ASSIGN { $$ = newToken($1, @1); };
minus_assign: MINUS_ASSIGN { $$ = newToken($1, @1); };
left_shift_assign: LEFT_SHIFT_ASSIGN { $$ = newToken($1, @1); };
right_shift_assign: RIGHT_SHIFT_ASSIGN { $$ = newToken($1, @1); };
ampersand_assign: AMPERSAND_ASSIGN { $$ = newToken($1, @1); };
caret_assign: CARET_ASSIGN { $$ = newToken($1, @1); };
bar_assign: BAR_ASSIGN { $$ = newToken($1, @1); };

left_bracket: LEFT_BRACKET { $$ = newToken($1, @1); };
right_bracket: RIGHT_BRACKET { $$ = newToken($1, @1); };
left_paren: LEFT_PAREN { $$ = newToken($1, @1); };
right_paren: RIGHT_PAREN { $$ = newToken($1, @1); };
left_brace: LEFT_BRACE { $$ = newToken($1, @1); };
right_brace: RIGHT_BRACE { $$ = newToken($1, @1); };
comma: COMMA { $$ = newToken($1, @1); };
colon: COLON { $$ = newToken($1, @1); };
semicolon: SEMICOLON { $$ = newToken($1, @1); };
ellipsis: ELLIPSIS { $$ = newToken($1, @1); };

/* 6.1 Lexical elements */
identifier_opt
: /* empty */ { $$ = undefined; }
| identifier
;
identifier
: IDENTIFIER {
    $$ = newToken("identifier", @1, $1);
}
;

typedef_identifier
: TYPEDEF_IDENTIFIER {
    $$ = newToken("typedef_identifier", @1, $1);
}
;

floating_constant
: FLOATING_CONSTANT {
    $$ = newToken("floating_constant", @1, $1);
}
;

integer_constant
: INTEGER_CONSTANT {
    $$ = newToken("integer_constant", @1, $1);
}
;

enumeration_constant
: IDENTIFIER {
    $$ = newToken("enumeration_constant", @1, $1);
}
;

character_constant
: CHARACTER_CONSTANT {
    $$ = newToken("character_constant", @1, $1);
}
;

string_literal
: STRING_LITERAL {
    $$ = newToken("string_literal", @1, $1);
}
;

/* 6.3 Expressions */
primary_expression
: identifier
| floating_constant
| integer_constant
| character_constant
| string_literal
| left_paren expression right_paren {
    $$ = newAst("primary_expression", {
        expression: $2,
        children: [$1, $2, $3],
    });
}
;

postfix_expression
: primary_expression
| postfix_expression left_bracket expression right_bracket {
    $$ = newAst("array_access", {
        postfix_expression: $1,
        expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| postfix_expression left_paren argument_expression_list_opt right_paren {
    $$ = newAst("function_call", {
        postfix_expression: $1,
        argument_expression_list: $3,
        children: [$1, $2, $3, $4],
    });
}
| postfix_expression period identifier {
    $$ = newAst("member_access", {
        postfix_expression: $1,
        identifier: $3,
        children: [$1, $2, $3],
    });
}
| postfix_expression arrow identifier {
    $$ = newAst("pointer_member_access", {
        postfix_expression: $1,
        identifier: $3,
        children: [$1, $2, $3],
    });
}
| postfix_expression increment {
    $$ = newAst("increment", {
        postfix_expression: $1,
        children: [$1, $2],
    });
}
| postfix_expression decrement {
    $$ = newAst("decrement", {
        postfix_expression: $1,
        children: [$1, $2],
    });
}
;

argument_expression_list_opt
: /* empty */ {
    $$ = newList("argument_expression_list", []);
}
| argument_expression_list
;
argument_expression_list
: assignment_expression {
    $$ = newList("argument_expression_list", [$1]);
}
| argument_expression_list comma assignment_expression {
    $$ = newList("argument_expression_list", [$1, $2, $3]);
}
;

unary_expression
: postfix_expression
| increment unary_expression {
    $$ = newAst("pre_increment", {
        unary_expression: $2,
        children: [$1, $2],
    });
}
| decrement unary_expression {
    $$ = newAst("pre_decrement", {
        unary_expression: $2,
        children: [$1, $2],
    });
}
| unary_operator cast_expression {
    $$ = newAst("unary", {
        unary_operator: $1,
        cast_expression: $2,
        children: [$1, $2],
    });
}
| sizeof unary_expression {
    $$ = newAst("sizeof_expression", {
        unary_expression: $2,
        children: [$1, $2],
    });
}
| sizeof left_paren type_name right_paren {
    $$ = newAst("sizeof_type", {
        type_name: $3,
        children: [$1, $2, $3, $4],
    });
}
;
unary_operator
: ampersand {
    $$ = addOperator("address_of", $1);
}
| asterisk {
    $$ = addOperator("indirection", $1);
}
| plus {
    $$ = addOperator("unary_plus", $1);
}
| minus {
    $$ = addOperator("unary_minus", $1);
}
| tilde {
    $$ = addOperator("bitwise_not", $1);
}
| exclamation {
    $$ = addOperator("logical_not", $1);
}
;

cast_expression
: unary_expression
| left_paren type_name right_paren cast_expression {
    $$ = newAst("cast", {
        type_name: $2,
        cast_expression: $4,
        children: [$1, $2, $3, $4],
    });
}
;

multiplicative_expression
: cast_expression
| multiplicative_expression asterisk cast_expression {
    $$ = newAst("multiplication", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| multiplicative_expression slash cast_expression {
    $$ = newAst("division", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| multiplicative_expression percent cast_expression {
    $$ = newAst("modulo", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

additive_expression
: multiplicative_expression
| additive_expression plus multiplicative_expression {
    $$ = newAst("addition", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| additive_expression minus multiplicative_expression {
    $$ = newAst("subtraction", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

shift_expression
: additive_expression
| shift_expression left_shift additive_expression {
    $$ = newAst("left_shift", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| shift_expression right_shift additive_expression {
    $$ = newAst("right_shift", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

relational_expression
: shift_expression
| relational_expression less_than shift_expression {
    $$ = newAst("less_than", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression greater_than shift_expression {
    $$ = newAst("greater_than", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression less_equal shift_expression {
    $$ = newAst("less_equal", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression greater_equal shift_expression {
    $$ = newAst("greater_equal", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

equality_expression
: relational_expression
| equality_expression equal relational_expression {
    $$ = newAst("equal", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| equality_expression not_equal relational_expression {
    $$ = newAst("not_equal", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

and_expression
: equality_expression
| and_expression ampersand equality_expression {
    $$ = newAst("bitwise_and", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

exclusive_or_expression
: and_expression
| exclusive_or_expression caret and_expression {
    $$ = newAst("bitwise_xor", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

inclusive_or_expression
: exclusive_or_expression
| inclusive_or_expression bar exclusive_or_expression {
    $$ = newAst("bitwise_or", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

logical_and_expression
: inclusive_or_expression
| logical_and_expression and inclusive_or_expression {
    $$ = newAst("logical_and", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

logical_or_expression
: logical_and_expression
| logical_or_expression or logical_and_expression {
    $$ = newAst("logical_or", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

conditional_expression
: logical_or_expression
| logical_or_expression question expression colon conditional_expression {
    $$ = newAst("ternary", {
        condition: $1,
        left: $3,
        right: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
;

assignment_expression
: conditional_expression
| unary_expression assignment_operator assignment_expression {
    $$ = newAst("assignment", {
        left: $1,
        assignment_operator: $2,
        right: $3,
        children: [$1, $2, $3],
    });
}
;
assignment_operator
: assign {
    $$ = addOperator("assign", $1);
}
| asterisk_assign {
    $$ = addOperator("multiply_assign", $1);
}
| slash_assign {
    $$ = addOperator("divide_assign", $1);
}
| percent_assign {
    $$ = addOperator("modulo_assign", $1);
}
| plus_assign {
    $$ = addOperator("add_assign", $1);
}
| minus_assign {
    $$ = addOperator("subtract_assign", $1);
}
| left_shift_assign {
    $$ = addOperator("left_shift_assign", $1);
}
| right_shift_assign {
    $$ = addOperator("right_shift_assign", $1);
}
| ampersand_assign {
    $$ = addOperator("bitwise_and_assign", $1);
}
| caret_assign {
    $$ = addOperator("bitwise_xor_assign", $1);
}
| bar_assign {
    $$ = addOperator("bitwise_or_assign", $1);
}
;

expression_opt
: /* empty */ { $$ = undefined; }
| expression
;
expression
: assignment_expression
| expression comma assignment_expression {
    $$ = newAst("comma", {
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

/* 6.4 Constant expressions */
constant_expression_opt
: /* empty */ { $$ = undefined; }
| constant_expression
;
constant_expression
: conditional_expression
;

/* 6.5 Declarations */
declaration
: declaration_specifiers init_declarator_list_opt semicolon {
    $$ = newAst("declaration", {
        declaration_specifiers: $1,
        init_declarator_list: $2,
        children: [$1, $2, $3],
    });
}
;

declaration_specifiers
: declaration_specifier {
    $$ = newList("declaration_specifiers", [$1]);
}
| declaration_specifiers declaration_specifier {
    $$ = newList("declaration_specifiers", [$1, $2]);
}
;
declaration_specifier
: storage_class_specifier {
    $$ = newAst("storage_class_specifier", {
        storage_class_specifier: $1,
        children: [$1],
    });
}
| type_specifier {
    $$ = newAst("type_specifier", {
        type_specifier: $1,
        children: [$1],
    });
}
| type_qualifier {
    $$ = newAst("type_qualifier", {
        type_qualifier: $1,
        children: [$1],
    });
}
;

init_declarator_list_opt
: /* empty */ {
    $$ = newList("init_declarator_list", []);
}
| init_declarator_list
;
init_declarator_list
: init_declarator {
    $$ = newList("init_declarator_list", [$1]);
}
| init_declarator_list comma init_declarator {
    $$ = newList("init_declarator_list", [$1, $2, $3]);
}
;

init_declarator
: declarator {
    $$ = newAst("init_declarator", {
        declarator: $1,
        initializer: undefined,
        children: [$1],
    });
}
| declarator assign initializer {
    $$ = newAst("init_declarator", {
        declarator: $1,
        initializer: $3,
        children: [$1, $2, $3],
    });
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
    $$ = newAst("struct_or_union_specifier", {
        struct_or_union: $1,
        identifier: $2,
        struct_declaration_list: $4,
        children: [$1, $2, $3, $4, $5],
    });
}
| struct_or_union identifier {
    $$ = newAst("struct_or_union_specifier", {
        struct_or_union: $1,
        identifier: $2,
        children: [$1, $2],
    });
}
;

struct_or_union
: struct {
    $$ = newAst("struct", {
        struct: $1,
        children: [$1],
    });
}
| union {
    $$ = newAst("struct", {
        union: $1,
        children: [$1],
    });
}
;

struct_declaration_list
: struct_declaration {
    $$ = newList("struct_declaration_list", [$1])
}
| struct_declaration_list struct_declaration {
    $$ = newList("struct_declaration_list", [$1, $2]);
}
;

struct_declaration
: specifier_qualifier_list struct_declarator_list semicolon {
    $$ = newAst("struct_declaration", {
        specifier_qualifier_list: $1,
        struct_declarator_list: $2,
        children: [$1, $2, $3],
    });
}
;

specifier_qualifier_list
: specifier_qualifier {
    $$ = newList("specifier_qualifier_list", [$1]);
}
| specifier_qualifier_list specifier_qualifier {
    $$ = newList("specifier_qualifier_list", [$1, $2]);
}
;

specifier_qualifier
: type_specifier {
    $$ = newAst("type_specifier", {
        type_specifier: $1,
        children: [$1],
    });
}
| type_qualifier {
    $$ = newAst("type_qualifier", {
        type_qualifier: $1,
        children: [$1],
    });
}
;

struct_declarator_list
: struct_declarator {
    $$ = newList("struct_declarator_list", [$1]);
}
| struct_declarator_list comma struct_declarator {
    $$ = newList("struct_declarator_list", [$1, $2, $3]);
}
;

struct_declarator
: declarator {
    $$ = newAst("struct_declarator", {
        declarator: $1,
        constant_expression: undefined,
        children: [$1],
    });
}
| colon constant_expression {
    $$ = newAst("struct_declarator", {
        declarator: undefined,
        constant_expression: $2,
        children: [$1, $2],
    });
}
| declarator colon constant_expression {
    $$ = newAst("struct_declarator", {
        declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3],
    });
}
;

enum_specifier
: enum identifier_opt left_brace enumerator_list right_brace {
    $$ = newAst("enum_specifier", {
        identifier: $2,
        enumerator_list: $4,
        children: [$1, $2, $3, $4, $5],
    });
}
| enum identifier {
    $$ = newAst("enum_specifier", {
        identifier: $2,
        children: [$1, $2],
    });
}
;

enumerator_list
: enumerator {
    $$ = newList("enumerator_list", [$1]);
}
| enumerator_list comma enumerator {
    $$ = newList("enumerator_list", [$1, $2, $3]);
}
;

enumerator
: enumeration_constant {
    $$ = newAst("enumerator", {
        enumeration_constant: $1,
        constant_expression: undefined,
        children: [$1],
    });
}
| enumeration_constant assign constant_expression {
    $$ = newAst("enumerator", {
        enumeration_constant: $1,
        constant_expression: $3,
        children: [$1, $2, $3],
    });
}
;

type_qualifier
: const
| volatile
;

declarator
: direct_declarator {
    $$ = newAst("declarator", {
        pointer: undefined,
        direct_declarator: $1,
        children: [$1],
    });
}
| pointer direct_declarator {
    $$ = newAst("declarator", {
        pointer: $1,
        direct_declarator: $2,
        children: [$1, $2],
    });
}
;

direct_declarator
: identifier {
    $$ = newAst("identifier_direct_declarator", {
        identifier: $1,
        children: [$1],
    });
}
| left_paren declarator right_paren {
    $$ = newAst("paren_direct_declarator", {
        declarator: $2,
        children: [$1, $2, $3],
    });
}
| direct_declarator left_bracket constant_expression_opt right_bracket {
    $$ = newAst("bracket_direct_declarator", {
        direct_declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| direct_declarator left_paren parameter_type_list right_paren {
    $$ = newAst("parameter_direct_declarator", {
        direct_declarator: $1,
        parameter_type_list: $3,
        children: [$1, $2, $3, $4],
    });
}
| direct_declarator left_paren identifier_list_opt right_paren {
    $$ = newAst("old_direct_declarator", {
        direct_declarator: $1,
        identifier_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

pointer
: asterisk type_qualifier_list_opt {
    $$ = newAst("pointer", {
        pointer: undefined,
        type_qualifier_list: $2,
        children: [$1, $2],
    });
}
| pointer asterisk type_qualifier_list_opt {
    $$ = newAst("pointer", {
        pointer: $1,
        type_qualifier_list: $3,
        children: [$1, $2, $3],
    });
}
;

type_qualifier_list_opt
: /* empty */ {
    $$ = newList("type_qualifier_list", []);
}
| type_qualifier_list
;
type_qualifier_list
: type_qualifier {
    $$ = newList("type_qualifier_list", [$1]);
}
| type_qualifier_list type_qualifier {
    $$ = newList("type_qualifier_list", [$1, $2]);
}
;

parameter_type_list_opt
: /* empty */ {
    $$ = newList("parameter_list", []);
}
| parameter_type_list
;
parameter_type_list
: parameter_list
| parameter_list comma ellipsis {
    $$ = newAst("parameter_list_ellipsis", {
        parameter_list: $1,
        children: [$1, $2, $3],
    });
}
;
parameter_list
: parameter_declaration {
    $$ = newList("parameter_list", [$1]);
}
| parameter_list comma parameter_declaration {
    $$ = newList("parameter_list", [$1, $2, $3]);
}
;

parameter_declaration
: declaration_specifiers declarator {
    $$ = newAst("parameter_declaration", {
        declaration_specifiers: $1,
        declarator: $2,
        children: [$1, $2],
    });
}
| declaration_specifiers abstract_declarator_opt {
    $$ = newAst("parameter_abstract_declaration", {
        declaration_specifiers: $1,
        abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

identifier_list_opt
: /* empty */ {
    $$ = newList("identifier_list", []);
}
| identifier_list
;
identifier_list
: identifier {
    $$ = newList("identifier_list", [$1]);
}
| identifier_list comma identifier {
    $$ = newList("identifier_list", [$1, $2, $3]);
}
;

type_name
: specifier_qualifier_list abstract_declarator_opt {
    $$ = newAst("type_name", {
        specifier_qualifier_list: $1,
        abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

abstract_declarator_opt
: /* empty */ {
    $$ = newAst("abstract_declarator", {
        pointer: undefined,
        direct_abstract_declarator: undefined,
        children: [],
    });
}
| abstract_declarator
;
abstract_declarator
: pointer {
    $$ = newAst("abstract_declarator", {
        pointer: $1,
        direct_abstract_declarator: undefined,
        children: [$1],
    });
}
| direct_abstract_declarator {
    $$ = newAst("abstract_declarator", {
        pointer: undefined,
        direct_abstract_declarator: $1,
        children: [$1],
    });
}
| pointer direct_abstract_declarator {
    $$ = newAst("abstract_declarator", {
        pointer: $1,
        direct_abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

direct_abstract_declarator
: left_paren abstract_declarator right_paren {
    $$ = newAst("paren_direct_abstract_declarator", {
        abstract_declarator: $2,
        children: [$1, $2, $3],
    });
}
| left_bracket constant_expression_opt right_bracket {
    $$ = newAst("bracket_direct_abstract_declarator", {
        direct_abstract_declarator: undefined,
        constant_expression: $2,
        children: [$1, $2, $3],
    });
}
| direct_abstract_declarator left_bracket constant_expression_opt right_bracket {
    $$ = newAst("bracket_direct_abstract_declarator", {
        direct_abstract_declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| left_paren parameter_type_list_opt right_paren {
    $$ = newAst("parameter_direct_abstract_declarator", {
        direct_abstract_declarator: undefined,
        parameter_type_list: $2,
        children: [$1, $2, $3],
    });
}
| direct_abstract_declarator left_paren parameter_type_list_opt right_paren {
    $$ = newAst("parameter_direct_abstract_declarator", {
        direct_abstract_declarator: $1,
        parameter_type_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

typedef_name
: typedef_identifier {
    $$ = newAst("typedef_name", {
        typedef_identifier: $1,
        children: [$1],
    });
}
;

initializer
: assignment_expression
| left_brace initializer_list right_brace {
    $$ = newAst("initializer", {
        initializer_list: $2,
        children: [$1, $2, $3],
    });
}
| left_brace initializer_list comma right_brace {
    $$ = newAst("initializer", {
        initializer_list: $2,
        children: [$1, $2, $3, $4],
    });
}
;

initializer_list
: initializer {
    $$ = newList("initializer_list", [$1]);
}
| initializer_list comma initializer {
    $$ = newList("initializer_list", [$1, $2, $3]);
}
;

/* 6.6 Statements */
statement
: labeled_statement {
    $$ = newAst("statement", {
        labeled_statement: $1,
        children: [$1],
    });
}
| compound_statement {
    $$ = newAst("statement", {
        compound_statement: $1,
        children: [$1],
    });
}
| expression_statement {
    $$ = newAst("statement", {
        expression_statement: $1,
        children: [$1],
    });
}
| selection_statement {
    $$ = newAst("statement", {
        selection_statement: $1,
        children: [$1],
    });
}
| iteration_statement {
    $$ = newAst("statement", {
        iteration_statement: $1,
        children: [$1],
    });
}
| jump_statement {
    $$ = newAst("statement", {
        jump_statement: $1,
        children: [$1],
    });
}
;

labeled_statement
: identifier colon statement {
    $$ = newAst("labeled_statement", {
        identifier: $1,
        statement: $3,
        children: [$1, $2, $3],
    });
}
| case constant_expression colon statement {
    $$ = newAst("case_statement", {
        constant_expression: $2,
        statement: $4,
        children: [$1, $2, $3, $4],
    });
}
| default colon statement {
    $$ = newAst("default_statement", {
        statement: $3,
        children: [$1, $2, $3],
    });
}
;

compound_statement
: left_brace declaration_list_opt statement_list_opt right_brace {
    $$ = newAst("compound_statement", {
        declaration_list: $2,
        statement_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

declaration_list_opt
: /* empty */ {
    $$ = newList("declaration_list", []);
}
| declaration_list
;
declaration_list
: declaration {
    $$ = newList("declaration_list", [$1]);
}
| declaration_list declaration {
    $$ = newList("declaration_list", [$1, $2]);
}
;

statement_list_opt
: /* empty */ {
    $$ = newList("statement_list", []);
}
| statement_list
;
statement_list
: statement {
    $$ = newList("statement_list", [$1]);
}
| statement_list statement {
    $$ = newList("statement_list", [$1, $2]);
}
;

expression_statement
: semicolon {
    $$ = newAst("expression_statement", {
        expression: undefined,
        children: [$1],
    });
}
| expression semicolon {
    $$ = newAst("expression_statement", {
        expression: $1,
        children: [$1, $2],
    });
}
;

selection_statement
: if left_paren expression right_paren statement %prec THEN {
    $$ = newAst("if_statement", {
        expression: $3,
        then: $5,
        else: undefined,
        children: [$1, $2, $3, $4, $5],
    });
}
| if left_paren expression right_paren statement else statement {
    $$ = newAst("if_statement", {
        expression: $3,
        then: $5,
        else: $7,
        children: [$1, $2, $3, $4, $5, $6, $7],
    });
}
| switch left_paren expression right_paren statement {
    $$ = newAst("switch_statement", {
        expression: $3,
        statement: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
;

iteration_statement
: while left_paren expression right_paren statement {
    $$ = newAst("while_statement", {
        expression: $3,
        statement: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
| do statement while left_paren expression right_paren semicolon {
    $$ = newAst("do_while_statement", {
        statement: $2,
        expression: $5,
        children: [$1, $2, $3, $4, $5, $6, $7],
    });
}
| for left_paren expression_opt semicolon expression_opt semicolon expression_opt right_paren statement {
    $$ = newAst("for_statement", {
        expression1: $3,
        expression2: $5,
        expression3: $7,
        statement: $9,
        children: [$1, $2, $3, $4, $5, $6, $7, $8, $9],
    });
}
;

jump_statement
: goto identifier semicolon {
    $$ = newAst("goto_statement", {
        identifier: $2,
        children: [$1, $2, $3],
    });
}
| continue semicolon {
    $$ = newAst("continue_statement", {
        children: [$1, $2],
    });
}
| break semicolon {
    $$ = newAst("break_statement", {
        children: [$1, $2],
    });
}
| return expression_opt semicolon {
    $$ = newAst("return_statement", {
        expression: $2,
        children: [$1, $2, $3],
    });
}
;

/* 6.7 External definitions */
translation_unit
: external_declaration {
    $$ = newList("translation_unit", [$1]);
}
| translation_unit external_declaration {
    $$ = newList("translation_unit", [$1, $2]);
}
;

external_declaration
: function_definition
| declaration {
    $$ = newAst("external_declaration", {
        declaration: $1,
        children: [$1],
    });
}
;

function_definition
: declarator declaration_list_opt compound_statement {
    const declaration_specifiers = newList("declaration_specifiers", []);
    $$ = newAst("function_definition", {
        declaration_specifiers,
        declarator: $1,
        declaration_list: $2,
        compound_statement: $3,
        children: [$1, $2, $3],
    });
}
| declaration_specifiers declarator declaration_list_opt compound_statement {
    $$ = newAst("function_definition", {
        declaration_specifiers: $1,
        declarator: $2,
        declaration_list: $3,
        compound_statement: $4,
        children: [$1, $2, $3, $4],
    });
}
;
