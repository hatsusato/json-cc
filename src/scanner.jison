%{
function hexlify(str: string): string {
  return str
    .split("")
    .map((ch) => "0x" + ch.charCodeAt(0).toString(16))
    .join(", ");
}
type LocationType = {
  first_line: number;
  first_column: number;
  last_line: number;
  last_column: number;
};
type AstNodeType = {
  type: string;
  children: AstNodeType[];
  [key: string]: any;
};
let counter: number = 0;
function new_ast(props: AstNodeType): AstNodeType {
  return {
    ...props,
    id: counter++,
  };
}
function new_token(type: string, loc: LocationType, value?: any): AstNodeType {
  return new_ast({ type, loc, children: [], value });
}
function new_list(props: AstNodeType): AstNodeType {
  const list =
    props.children.length < 2
      ? props.children
      : [...props.children[0].list, props.children[props.children.length - 1]];
  return new_ast({ ...props, list });
}
function add_operator(operator: string, props: AstNodeType): AstNodeType {
    return {...props, operator};
}
function yyscan_is_typedef(str: string): boolean {
  return false;
}
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
  if (yyscan_is_typedef(yytext)) {
    return "TYPEDEF_IDENTIFIER";
  } else {
    return "IDENTIFIER";
  }
}
{floating_constant}     { return "FLOATING_CONSTANT";  }
{integer_constant}      { return "INTEGER_CONSTANT";   }
{character_constant}    { return "CHARACTER_CONSTANT"; }
{string_literal}        { return "STRING_LITERAL";     }
. { console.log("unknown token:", hexlify(yytext)); }

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

auto: AUTO { $$ = new_token($1, @1); };
break: BREAK { $$ = new_token($1, @1); };
case: CASE { $$ = new_token($1, @1); };
char: CHAR { $$ = new_token($1, @1); };
const: CONST { $$ = new_token($1, @1); };
continue: CONTINUE { $$ = new_token($1, @1); };
default: DEFAULT { $$ = new_token($1, @1); };
do: DO { $$ = new_token($1, @1); };
double: DOUBLE { $$ = new_token($1, @1); };
else: ELSE { $$ = new_token($1, @1); };
enum: ENUM { $$ = new_token($1, @1); };
extern: EXTERN { $$ = new_token($1, @1); };
float: FLOAT { $$ = new_token($1, @1); };
for: FOR { $$ = new_token($1, @1); };
goto: GOTO { $$ = new_token($1, @1); };
if: IF { $$ = new_token($1, @1); };
int: INT { $$ = new_token($1, @1); };
long: LONG { $$ = new_token($1, @1); };
register: REGISTER { $$ = new_token($1, @1); };
return: RETURN { $$ = new_token($1, @1); };
short: SHORT { $$ = new_token($1, @1); };
signed: SIGNED { $$ = new_token($1, @1); };
sizeof: SIZEOF { $$ = new_token($1, @1); };
static: STATIC { $$ = new_token($1, @1); };
struct: STRUCT { $$ = new_token($1, @1); };
switch: SWITCH { $$ = new_token($1, @1); };
typedef: TYPEDEF { $$ = new_token($1, @1); };
union: UNION { $$ = new_token($1, @1); };
unsigned: UNSIGNED { $$ = new_token($1, @1); };
void: VOID { $$ = new_token($1, @1); };
volatile: VOLATILE { $$ = new_token($1, @1); };
while: WHILE { $$ = new_token($1, @1); };

period: PERIOD { $$ = new_token($1, @1); };
arrow: ARROW { $$ = new_token($1, @1); };
increment: INCREMENT { $$ = new_token($1, @1); };
decrement: DECREMENT { $$ = new_token($1, @1); };
ampersand: AMPERSAND { $$ = new_token($1, @1); };
asterisk: ASTERISK { $$ = new_token($1, @1); };
plus: PLUS { $$ = new_token($1, @1); };
minus: MINUS { $$ = new_token($1, @1); };
tilde: TILDE { $$ = new_token($1, @1); };
exclamation: EXCLAMATION { $$ = new_token($1, @1); };
slash: SLASH { $$ = new_token($1, @1); };
percent: PERCENT { $$ = new_token($1, @1); };
left_shift: LEFT_SHIFT { $$ = new_token($1, @1); };
right_shift: RIGHT_SHIFT { $$ = new_token($1, @1); };
less_than: LESS_THAN { $$ = new_token($1, @1); };
greater_than: GREATER_THAN { $$ = new_token($1, @1); };
less_equal: LESS_EQUAL { $$ = new_token($1, @1); };
greater_equal: GREATER_EQUAL { $$ = new_token($1, @1); };
equal: EQUAL { $$ = new_token($1, @1); };
not_equal: NOT_EQUAL { $$ = new_token($1, @1); };
caret: CARET { $$ = new_token($1, @1); };
bar: BAR { $$ = new_token($1, @1); };
and: AND { $$ = new_token($1, @1); };
or: OR { $$ = new_token($1, @1); };
question: QUESTION { $$ = new_token($1, @1); };
assign: ASSIGN { $$ = new_token($1, @1); };
asterisk_assign: ASTERISK_ASSIGN { $$ = new_token($1, @1); };
slash_assign: SLASH_ASSIGN { $$ = new_token($1, @1); };
percent_assign: PERCENT_ASSIGN { $$ = new_token($1, @1); };
plus_assign: PLUS_ASSIGN { $$ = new_token($1, @1); };
minus_assign: MINUS_ASSIGN { $$ = new_token($1, @1); };
left_shift_assign: LEFT_SHIFT_ASSIGN { $$ = new_token($1, @1); };
right_shift_assign: RIGHT_SHIFT_ASSIGN { $$ = new_token($1, @1); };
ampersand_assign: AMPERSAND_ASSIGN { $$ = new_token($1, @1); };
caret_assign: CARET_ASSIGN { $$ = new_token($1, @1); };
bar_assign: BAR_ASSIGN { $$ = new_token($1, @1); };

left_bracket: LEFT_BRACKET { $$ = new_token($1, @1); };
right_bracket: RIGHT_BRACKET { $$ = new_token($1, @1); };
left_paren: LEFT_PAREN { $$ = new_token($1, @1); };
right_paren: RIGHT_PAREN { $$ = new_token($1, @1); };
left_brace: LEFT_BRACE { $$ = new_token($1, @1); };
right_brace: RIGHT_BRACE { $$ = new_token($1, @1); };
comma: COMMA { $$ = new_token($1, @1); };
colon: COLON { $$ = new_token($1, @1); };
semicolon: SEMICOLON { $$ = new_token($1, @1); };
ellipsis: ELLIPSIS { $$ = new_token($1, @1); };

/* 6.1 Lexical elements */
identifier_opt
: /* empty */ { $$ = null; }
| identifier
;
identifier
: IDENTIFIER {
    $$ = new_token("identifier", @1, $1);
}
;

typedef_identifier
: TYPEDEF_IDENTIFIER {
    $$ = new_token("typedef_identifier", @1, $1);
}
;

floating_constant
: FLOATING_CONSTANT {
    $$ = new_token("floating_constant", @1, $1);
}
;

integer_constant
: INTEGER_CONSTANT {
    $$ = new_token("integer_constant", @1, $1);
}
;

enumeration_constant
: IDENTIFIER {
    $$ = new_token("enumeration_constant", @1, $1);
}
;

character_constant
: CHARACTER_CONSTANT {
    $$ = new_token("character_constant", @1, $1);
}
;

string_literal
: STRING_LITERAL {
    $$ = new_token("string_literal", @1, $1);
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
    $$ = new_ast({
        type: "primary_expression",
        expression: $2,
        children: [$1, $2, $3]
    });
}
;

postfix_expression
: primary_expression
| postfix_expression left_bracket expression right_bracket {
    $$ = new_ast({
        type: "array_access",
        postfix_expression: $1,
        expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| postfix_expression left_paren argument_expression_list_opt right_paren {
    $$ = new_ast({
        type: "function_call",
        postfix_expression: $1,
        argument_expression_list: $3,
        children: [$1, $2, $3, $4],
    });
}
| postfix_expression period identifier {
    $$ = new_ast({
        type: "member_access",
        postfix_expression: $1,
        identifier: $3,
        children: [$1, $2, $3],
    });
}
| postfix_expression arrow identifier {
    $$ = new_ast({
        type: "pointer_member_access",
        postfix_expression: $1,
        identifier: $3,
        children: [$1, $2, $3],
    });
}
| postfix_expression increment {
    $$ = new_ast({
        type: "increment",
        postfix_expression: $1,
        children: [$1, $2],
    });
}
| postfix_expression decrement {
    $$ = new_ast({
        type: "decrement",
        postfix_expression: $1,
        children: [$1, $2],
    });
}
;

argument_expression_list_opt
: /* empty */ {
    $$ = new_list({
        type: "argument_expression_list",
        children: [],
    });
}
| argument_expression_list
;
argument_expression_list
: assignment_expression {
    $$ = new_list({
        type: "argument_expression_list",
        children: [$1],
    });
}
| argument_expression_list comma assignment_expression {
    $$ = new_list({
        type: "argument_expression_list",
        children: [$1, $2, $3],
    });
}
;

unary_expression
: postfix_expression
| increment unary_expression {
    $$ = new_ast({
        type: "pre_increment",
        unary_expression: $2,
        children: [$1, $2],
    });
}
| decrement unary_expression {
    $$ = new_ast({
        type: "pre_decrement",
        unary_expression: $2,
        children: [$1, $2],
    });
}
| unary_operator cast_expression {
    $$ = new_ast({
        type: "unary",
        unary_operator: $1,
        cast_expression: $2,
        children: [$1, $2],
    });
}
| sizeof unary_expression {
    $$ = new_ast({
        type: "sizeof_expression",
        unary_expression: $2,
        children: [$1, $2],
    });
}
| sizeof left_paren type_name right_paren {
    $$ = new_ast({
        type: "sizeof_type",
        type_name: $3,
        children: [$1, $2, $3, $4],
    });
}
;
unary_operator
: ampersand {
    $$ = add_operator("address_of", $1);
}
| asterisk {
    $$ = add_operator("indirection", $1);
}
| plus {
    $$ = add_operator("unary_plus", $1);
}
| minus {
    $$ = add_operator("unary_minus", $1);
}
| tilde {
    $$ = add_operator("bitwise_not", $1);
}
| exclamation {
    $$ = add_operator("logical_not", $1);
}
;

cast_expression
: unary_expression
| left_paren type_name right_paren cast_expression {
    $$ = new_ast({
        type: "cast",
        type_name: $2,
        cast_expression: $4,
        children: [$1, $2, $3, $4],
    });
}
;

multiplicative_expression
: cast_expression
| multiplicative_expression asterisk cast_expression {
    $$ = new_ast({
        type: "multiplication",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| multiplicative_expression slash cast_expression {
    $$ = new_ast({
        type: "division",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| multiplicative_expression percent cast_expression {
    $$ = new_ast({
        type: "modulo",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

additive_expression
: multiplicative_expression
| additive_expression plus multiplicative_expression {
    $$ = new_ast({
        type: "addition",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| additive_expression minus multiplicative_expression {
    $$ = new_ast({
        type: "subtraction",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

shift_expression
: additive_expression
| shift_expression left_shift additive_expression {
    $$ = new_ast({
        type: "left_shift",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| shift_expression right_shift additive_expression {
    $$ = new_ast({
        type: "right_shift",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

relational_expression
: shift_expression
| relational_expression less_than shift_expression {
    $$ = new_ast({
        type: "less_than",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression greater_than shift_expression {
    $$ = new_ast({
        type: "greater_than",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression less_equal shift_expression {
    $$ = new_ast({
        type: "less_equal",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| relational_expression greater_equal shift_expression {
    $$ = new_ast({
        type: "greater_equal",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

equality_expression
: relational_expression
| equality_expression equal relational_expression {
    $$ = new_ast({
        type: "equal",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
| equality_expression not_equal relational_expression {
    $$ = new_ast({
        type: "not_equal",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

and_expression
: equality_expression
| and_expression ampersand equality_expression {
    $$ = new_ast({
        type: "bitwise_and",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

exclusive_or_expression
: and_expression
| exclusive_or_expression caret and_expression {
    $$ = new_ast({
        type: "bitwise_xor",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

inclusive_or_expression
: exclusive_or_expression
| inclusive_or_expression bar exclusive_or_expression {
    $$ = new_ast({
        type: "bitwise_or",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

logical_and_expression
: inclusive_or_expression
| logical_and_expression and inclusive_or_expression {
    $$ = new_ast({
        type: "logical_and",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

logical_or_expression
: logical_and_expression
| logical_or_expression or logical_and_expression {
    $$ = new_ast({
        type: "logical_or",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

conditional_expression
: logical_or_expression
| logical_or_expression question expression colon conditional_expression {
    $$ = new_ast({
        type: "ternary",
        condition: $1,
        true_expression: $3,
        false_expression: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
;

assignment_expression
: conditional_expression
| unary_expression assignment_operator assignment_expression {
    $$ = new_ast({
        type: "assignment",
        left: $1,
        assignment_operator: $2,
        right: $3,
        children: [$1, $2, $3],
    });
}
;
assignment_operator
: assign {
    $$ = add_operator("assign", $1);
}
| asterisk_assign {
    $$ = add_operator("multiply_assign", $1);
}
| slash_assign {
    $$ = add_operator("divide_assign", $1);
}
| percent_assign {
    $$ = add_operator("modulo_assign", $1);
}
| plus_assign {
    $$ = add_operator("add_assign", $1);
}
| minus_assign {
    $$ = add_operator("subtract_assign", $1);
}
| left_shift_assign {
    $$ = add_operator("left_shift_assign", $1);
}
| right_shift_assign {
    $$ = add_operator("right_shift_assign", $1);
}
| ampersand_assign {
    $$ = add_operator("bitwise_and_assign", $1);
}
| caret_assign {
    $$ = add_operator("bitwise_xor_assign", $1);
}
| bar_assign {
    $$ = add_operator("bitwise_or_assign", $1);
}
;

expression_opt
: /* empty */ { $$ = null; }
| expression
;
expression
: assignment_expression
| expression comma assignment_expression {
    $$ = new_ast({
        type: "comma",
        left: $1,
        right: $3,
        children: [$1, $2, $3],
    });
}
;

/* 6.4 Constant expressions */
constant_expression_opt
: /* empty */ { $$ = null; }
| constant_expression
;
constant_expression
: conditional_expression
;

/* 6.5 Declarations */
declaration
: declaration_specifiers init_declarator_list_opt semicolon {
    $$ = new_ast({
        type: "declaration",
        declaration_specifiers: $1,
        init_declarator_list: $2,
        children: [$1, $2, $3],
    });
}
;

declaration_specifiers
: declaration_specifier {
    $$ = new_list({
        type: "declaration_specifiers",
        children: [$1],
    });
}
| declaration_specifiers declaration_specifier {
    $$ = new_list({
        type: "declaration_specifiers",
        children: [$1, $2],
    });
}
;
declaration_specifier
: storage_class_specifier {
    $$ = new_ast({
        type: "storage_class_specifier",
        storage_class_specifier: $1,
        children: [$1],
    });
}
| type_specifier {
    $$ = new_ast({
        type: "type_specifier",
        type_specifier: $1,
        children: [$1],
    });
}
| type_qualifier {
    $$ = new_ast({
        type: "type_qualifier",
        type_qualifier: $1,
        children: [$1],
    });
}
;

init_declarator_list_opt
: /* empty */ {
    $$ = new_list({
        type: "init_declarator_list",
        children: [],
    });
}
| init_declarator_list
;
init_declarator_list
: init_declarator {
    $$ = new_list({
        type: "init_declarator_list",
        children: [$1],
    });
}
| init_declarator_list comma init_declarator {
    $$ = new_list({
        type: "init_declarator_list",
        children: [$1, $2, $3],
    });
}
;

init_declarator
: declarator {
    $$ = new_ast({
        type: "init_declarator",
        declarator: $1,
        initializer: null,
        children: [$1],
    });
}
| declarator assign initializer {
    $$ = new_ast({
        type: "init_declarator",
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
    $$ = new_ast({
        type: "struct_or_union_specifier",
        struct_or_union: $1,
        identifier: $2,
        struct_declaration_list: $4,
        children: [$1, $2, $3, $4, $5],
    });
}
| struct_or_union identifier {
    $$ = new_ast({
        type: "struct_or_union_specifier",
        struct_or_union: $1,
        identifier: $2,
        children: [$1, $2],
    });
}
;

struct_or_union
: struct {
    $$ = new_ast({
        type: "struct",
        struct: $1,
        children: [$1],
    });
}
| union {
    $$ = new_ast({
        type: "struct",
        union: $1,
        children: [$1],
    });
}
;

struct_declaration_list
: struct_declaration {
    $$ = new_list({
        type: "struct_declaration_list",
        children: [$1],
    })
}
| struct_declaration_list struct_declaration {
    $$ = new_list({
        type: "struct_declaration_list",
        children: [$1, $2],
    });
}
;

struct_declaration
: specifier_qualifier_list struct_declarator_list semicolon {
    $$ = new_ast({
        type: "struct_declaration",
        specifier_qualifier_list: $1,
        struct_declarator_list: $2,
        children: [$1, $2, $3],
    });
}
;

specifier_qualifier_list
: specifier_qualifier {
    $$ = new_list({
        type: "specifier_qualifier_list",
        children: [$1],
    });
}
| specifier_qualifier_list specifier_qualifier {
    $$ = new_list({
        type: "specifier_qualifier_list",
        children: [$1, $2],
    });
}
;

specifier_qualifier
: type_specifier {
    $$ = new_ast({
        type: "type_specifier",
        type_specifier: $1,
        children: [$1],
    });
}
| type_qualifier {
    $$ = new_ast({
        type: "type_qualifier",
        type_qualifier: $1,
        children: [$1],
    });
}
;

struct_declarator_list
: struct_declarator {
    $$ = new_list({
        type: "struct_declarator_list",
        children: [$1],
    });
}
| struct_declarator_list comma struct_declarator {
    $$ = new_list({
        type: "struct_declarator_list",
        children: [$1, $2, $3],
    });
}
;

struct_declarator
: declarator {
    $$ = new_ast({
        type: "struct_declarator",
        declarator: $1,
        constant_expression: null,
        children: [$1],
    });
}
| colon constant_expression {
    $$ = new_ast({
        type: "struct_declarator",
        declarator: null,
        constant_expression: $2,
        children: [$1, $2],
    });
}
| declarator colon constant_expression {
    $$ = new_ast({
        type: "struct_declarator",
        declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3],
    });
}
;

enum_specifier
: enum identifier_opt left_brace enumerator_list right_brace {
    $$ = new_ast({
        type: "enum_specifier",
        identifier: $2,
        enumerator_list: $4,
        children: [$1, $2, $3, $4, $5],
    });
}
| enum identifier {
    $$ = new_ast({
        type: "enum_specifier",
        identifier: $2,
        children: [$1, $2],
    });
}
;

enumerator_list
: enumerator {
    $$ = new_list({
        type: "enumerator_list",
        children: [$1],
    });
}
| enumerator_list comma enumerator {
    $$ = new_list({
        type: "enumerator_list",
        children: [$1, $2, $3],
    });
}
;

enumerator
: enumeration_constant {
    $$ = new_ast({
        type: "enumerator",
        enumeration_constant: $1,
        constant_expression: null,
        children: [$1],
    });
}
| enumeration_constant assign constant_expression {
    $$ = new_ast({
        type: "enumerator",
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
    $$ = new_ast({
        type: "declarator",
        pointer: null,
        direct_declarator: $1,
        children: [$1],
    });
}
| pointer direct_declarator {
    $$ = new_ast({
        type: "declarator",
        pointer: $1,
        direct_declarator: $2,
        children: [$1, $2],
    });
}
;

direct_declarator
: identifier {
    $$ = new_ast({
        type: "identifier_direct_declarator",
        identifier: $1,
        children: [$1],
    });
}
| left_paren declarator right_paren {
    $$ = new_ast({
        type: "paren_direct_declarator",
        declarator: $2,
        children: [$1, $2, $3],
    });
}
| direct_declarator left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        type: "bracket_direct_declarator",
        direct_declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| direct_declarator left_paren parameter_type_list right_paren {
    $$ = new_ast({
        type: "parameter_direct_declarator",
        direct_declarator: $1,
        parameter_type_list: $3,
        children: [$1, $2, $3, $4],
    });
}
| direct_declarator left_paren identifier_list_opt right_paren {
    $$ = new_ast({
        type: "old_direct_declarator",
        direct_declarator: $1,
        identifier_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

pointer
: asterisk type_qualifier_list_opt {
    $$ = new_ast({
        type: "pointer",
        pointer: null,
        asterisk: $1,
        type_qualifier_list: $2,
        children: [$1, $2],
    });
}
| pointer asterisk type_qualifier_list_opt {
    $$ = new_ast({
        type: "pointer",
        pointer: $1,
        asterisk: $2,
        type_qualifier_list: $3,
        children: [$1, $2, $3],
    });
}
;

type_qualifier_list_opt
: /* empty */ {
    $$ = new_list({
        type: "type_qualifier_list",
        children: [],
    });
}
| type_qualifier_list
;
type_qualifier_list
: type_qualifier {
    $$ = new_list({
        type: "type_qualifier_list",
        children: [$1],
    });
}
| type_qualifier_list type_qualifier {
    $$ = new_list({
        type: "type_qualifier_list",
        children: [$1, $2],
    });
}
;

parameter_type_list_opt
: /* empty */ {
    $$ = new_list({
        type: "parameter_list",
        children: [],
    });
}
| parameter_type_list
;
parameter_type_list
: parameter_list
| parameter_list comma ellipsis {
    $$ = new_ast({
        type: "parameter_list_ellipsis",
        parameter_list: $1,
        children: [$1, $2, $3],
    });
}
;
parameter_list
: parameter_declaration {
    $$ = new_list({
        type: "parameter_list",
        children: [$1],
    });
}
| parameter_list comma parameter_declaration {
    $$ = new_list({
        type: "parameter_list",
        children: [$1, $2, $3],
    });
}
;

parameter_declaration
: declaration_specifiers declarator {
    $$ = new_ast({
        type: "parameter_declaration",
        declaration_specifiers: $1,
        declarator: $2,
        children: [$1, $2],
    });
}
| declaration_specifiers abstract_declarator_opt {
    $$ = new_ast({
        type: "parameter_abstract_declaration",
        declaration_specifiers: $1,
        abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

identifier_list_opt
: /* empty */ {
    $$ = new_list({
        type: "identifier_list",
        children: [],
    });
}
| identifier_list
;
identifier_list
: identifier {
    $$ = new_list({
        type: "identifier_list",
        children: [$1],
    });
}
| identifier_list comma identifier {
    $$ = new_list({
        type: "identifier_list",
        children: [$1, $2, $3],
    });
}
;

type_name
: specifier_qualifier_list abstract_declarator_opt {
    $$ = new_ast({
        type: "type_name",
        specifier_qualifier_list: $1,
        abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

abstract_declarator_opt
: /* empty */ {
    $$ = new_ast({
        type: "abstract_declarator",
        pointer: null,
        direct_abstract_declarator: null,
        children: [],
    });
}
| abstract_declarator
;
abstract_declarator
: pointer {
    $$ = new_ast({
        type: "abstract_declarator",
        pointer: $1,
        direct_abstract_declarator: null,
        children: [$1],
    });
}
| direct_abstract_declarator {
    $$ = new_ast({
        type: "abstract_declarator",
        pointer: null,
        direct_abstract_declarator: $1,
        children: [$1],
    });
}
| pointer direct_abstract_declarator {
    $$ = new_ast({
        type: "abstract_declarator",
        pointer: $1,
        direct_abstract_declarator: $2,
        children: [$1, $2],
    });
}
;

direct_abstract_declarator
: left_paren abstract_declarator right_paren {
    $$ = new_ast({
        type: "paren_direct_abstract_declarator",
        abstract_declarator: $2,
        children: [$1, $2, $3],
    });
}
| left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        type: "bracket_direct_abstract_declarator",
        direct_abstract_declarator: null,
        constant_expression: $2,
        children: [$1, $2, $3],
    });
}
| direct_abstract_declarator left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        type: "bracket_direct_abstract_declarator",
        direct_abstract_declarator: $1,
        constant_expression: $3,
        children: [$1, $2, $3, $4],
    });
}
| left_paren parameter_type_list_opt right_paren {
    $$ = new_ast({
        type: "parameter_direct_abstract_declarator",
        direct_abstract_declarator: null,
        parameter_type_list: $2,
        children: [$1, $2, $3],
    });
}
| direct_abstract_declarator left_paren parameter_type_list_opt right_paren {
    $$ = new_ast({
        type: "parameter_direct_abstract_declarator",
        direct_abstract_declarator: $1,
        parameter_type_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

typedef_name
: typedef_identifier {
    $$ = new_ast({
        type: "typedef_name",
        typedef_identifier: $1,
        children: [$1],
    });
}
;

initializer
: assignment_expression
| left_brace initializer_list right_brace {
    $$ = new_ast({
        type: "initializer",
        initializer_list: $2,
        children: [$1, $2, $3],
    });
}
| left_brace initializer_list comma right_brace {
    $$ = new_ast({
        type: "initializer",
        initializer_list: $2,
        children: [$1, $2, $3, $4],
    });
}
;

initializer_list
: initializer {
    $$ = new_list({
        type: "initializer_list",
        children: [$1],
    });
}
| initializer_list comma initializer {
    $$ = new_list({
        type: "initializer_list",
        children: [$1, $2, $3],
    });
}
;

/* 6.6 Statements */
statement
: labeled_statement {
    $$ = new_ast({
        type: "statement",
        labeled_statement: $1,
        children: [$1],
    });
}
| compound_statement {
    $$ = new_ast({
        type: "statement",
        compound_statement: $1,
        children: [$1],
    });
}
| expression_statement {
    $$ = new_ast({
        type: "statement",
        expression_statement: $1,
        children: [$1],
    });
}
| selection_statement {
    $$ = new_ast({
        type: "statement",
        selection_statement: $1,
        children: [$1],
    });
}
| iteration_statement {
    $$ = new_ast({
        type: "statement",
        iteration_statement: $1,
        children: [$1],
    });
}
| jump_statement {
    $$ = new_ast({
        type: "statement",
        jump_statement: $1,
        children: [$1],
    });
}
;

labeled_statement
: identifier colon statement {
    $$ = new_ast({
        type: "labeled_statement",
        identifier: $1,
        statement: $3,
        children: [$1, $2, $3],
    });
}
| case constant_expression colon statement {
    $$ = new_ast({
        type: "case_statement",
        case: $1,
        constant_expression: $2,
        statement: $4,
        children: [$1, $2, $3, $4],
    });
}
| default colon statement {
    $$ = new_ast({
        type: "default_statement",
        default: $1,
        statement: $3,
        children: [$1, $2, $3],
    });
}
;

compound_statement
: left_brace declaration_list_opt statement_list_opt right_brace {
    $$ = new_ast({
        type: "compound_statement",
        declaration_list: $2,
        statement_list: $3,
        children: [$1, $2, $3, $4],
    });
}
;

declaration_list_opt
: /* empty */ {
    $$ = new_list({
        type: "declaration_list",
        children: [],
    });
}
| declaration_list
;
declaration_list
: declaration {
    $$ = new_list({
        type: "declaration_list",
        children: [$1],
    });
}
| declaration_list declaration {
    $$ = new_list({
        type: "declaration_list",
        children: [$1, $2],
    });
}
;

statement_list_opt
: /* empty */ {
    $$ = new_list({
        type: "statement_list",
        children: [],
    });
}
| statement_list
;
statement_list
: statement {
    $$ = new_list({
        type: "statement_list",
        children: [$1],
    });
}
| statement_list statement {
    $$ = new_list({
        type: "statement_list",
        children: [$1, $2],
    });
}
;

expression_statement
: semicolon {
    $$ = new_ast({
        type: "expression_statement",
        expression: null,
        children: [$1],
    });
}
| expression semicolon {
    $$ = new_ast({
        type: "expression_statement",
        expression: $1,
        children: [$1, $2],
    });
}
;

selection_statement
: if left_paren expression right_paren statement %prec THEN {
    $$ = new_ast({
        type: "if_statement",
        if: $1,
        expression: $3,
        then: $5,
        else: null,
        children: [$1, $2, $3, $4, $5],
    });
}
| if left_paren expression right_paren statement else statement {
    $$ = new_ast({
        type: "if_statement",
        if: $1,
        expression: $3,
        then: $5,
        else: $7,
        children: [$1, $2, $3, $4, $5, $6, $7],
    });
}
| switch left_paren expression right_paren statement {
    $$ = new_ast({
        type: "switch_statement",
        switch: $1,
        expression: $3,
        statement: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
;

iteration_statement
: while left_paren expression right_paren statement {
    $$ = new_ast({
        type: "while_statement",
        while: $1,
        expression: $3,
        statement: $5,
        children: [$1, $2, $3, $4, $5],
    });
}
| do statement while left_paren expression right_paren semicolon {
    $$ = new_ast({
        type: "do_while_statement",
        do: $1,
        statement: $2,
        expression: $5,
        children: [$1, $2, $3, $4, $5, $6, $7],
    });
}
| for left_paren expression_opt semicolon expression_opt semicolon expression_opt right_paren statement {
    $$ = new_ast({
        type: "for_statement",
        for: $1,
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
    $$ = new_ast({
        type: "goto_statement",
        goto: $1,
        identifier: $2,
        children: [$1, $2, $3],
    });
}
| continue semicolon {
    $$ = new_ast({
        type: "continue_statement",
        continue: $1,
        children: [$1, $2],
    });
}
| break semicolon {
    $$ = new_ast({
        type: "break_statement",
        break: $1,
        children: [$1, $2],
    });
}
| return expression_opt semicolon {
    $$ = new_ast({
        type: "return_statement",
        return: $1,
        expression: $2,
        children: [$1, $2, $3],
    });
}
;

/* 6.7 External definitions */
translation_unit
: external_declaration {
    $$ = new_list({
        type: "translation_unit",
        children: [$1],
    });
}
| translation_unit external_declaration {
    $$ = new_list({
        type: "translation_unit",
        children: [$1, $2],
    });
}
;

external_declaration
: function_definition
| declaration {
    $$ = new_ast({
        type: "external_declaration",
        declaration: $1,
        children: [$1],
    });
}
;

function_definition
: declarator declaration_list_opt compound_statement {
    const declaration_specifiers = new_list({
        type: "declaration_specifiers",
        children: [],
    });
    $$ = new_ast({
        type: "function_definition",
        declaration_specifiers,
        declarator: $1,
        declaration_list: $2,
        compound_statement: $3,
        children: [$1, $2, $3],
    });
}
| declaration_specifiers declarator declaration_list_opt compound_statement {
    $$ = new_ast({
        type: "function_definition",
        declaration_specifiers: $1,
        declarator: $2,
        declaration_list: $3,
        compound_statement: $4,
        children: [$1, $2, $3, $4],
    });
}
;
