%{
function hexlify (str:string): string {
  return str.split('')
    .map(ch => '0x' + ch.charCodeAt(0).toString(16))
    .join(', ')
}
const root: object[] = [];
function new_ast(children: object): number {
    const id = root.length;
    const ast = { kind: "ast", age: 0, id, children };
    root.push(ast);
    return id;
}
function get_root(top: number): object {
    return { root, top };
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
top: translation_unit {
    return get_root(new_ast({
        translation_unit: $1,
    }));
}
;

auto: AUTO ;
break: BREAK ;
case: CASE ;
char: CHAR ;
const: CONST ;
continue: CONTINUE ;
default: DEFAULT ;
do: DO ;
double: DOUBLE ;
else: ELSE ;
enum: ENUM ;
extern: EXTERN ;
float: FLOAT ;
for: FOR ;
goto: GOTO ;
if: IF ;
int: INT ;
long: LONG ;
register: REGISTER ;
return: RETURN ;
short: SHORT ;
signed: SIGNED ;
sizeof: SIZEOF ;
static: STATIC ;
struct: STRUCT ;
switch: SWITCH ;
typedef: TYPEDEF ;
union: UNION ;
unsigned: UNSIGNED ;
void: VOID ;
volatile: VOLATILE ;
while: WHILE ;

period: PERIOD ;
arrow: ARROW ;
increment: INCREMENT ;
decrement: DECREMENT ;
ampersand: AMPERSAND ;
asterisk: ASTERISK ;
plus: PLUS ;
minus: MINUS ;
tilde: TILDE ;
exclamation: EXCLAMATION ;
slash: SLASH ;
percent: PERCENT ;
left_shift: LEFT ;
right_shift: RIGHT ;
less_than: LESS ;
greater_than: GREATER ;
less_equal: LESS ;
greater_equal: GREATER ;
equal: EQUAL ;
not_equal: NOT ;
caret: CARET ;
bar: BAR ;
and: AND ;
or: OR ;
question: QUESTION ;
assign: ASSIGN ;
asterisk_assign: ASTERISK ;
slash_assign: SLASH ;
percent_assign: PERCENT ;
plus_assign: PLUS ;
minus_assign: MINUS ;
left_shift_assign: LEFT ;
right_shift_assign: RIGHT ;
ampersand_assign: AMPERSAND ;
caret_assign: CARET ;
bar_assign: BAR ;

left_bracket: LEFT ;
right_bracket: RIGHT ;
left_paren: LEFT_PAREN ;
right_paren: RIGHT_PAREN ;
left_brace: LEFT_BRACE ;
right_brace: RIGHT_BRACE ;
comma: COMMA ;
colon: COLON ;
semicolon: SEMICOLON ;
ellipsis: ELLIPSIS ;

/* 6.1 Lexical elements */
identifier_opt
: /* empty */ {
    $$ = null;
}
| identifier {
    $$ = $1;
}
;
identifier
: IDENTIFIER {
    $$ = new_ast({
        value: $1,
        type: "identifier",
    });
}
;

typedef_identifier
: TYPEDEF_IDENTIFIER {
    $$ = new_ast({
        value: $1,
        type: "typedef_identifier",
    });
}
;

floating_constant
: FLOATING_CONSTANT {
    $$ = new_ast({
        value: $1,
        type: "floating_constant",
    });
}
;

integer_constant
: INTEGER_CONSTANT {
    $$ = new_ast({
        value: $1,
        type: "integer_constant",
    });
}
;

enumeration_constant
: IDENTIFIER {
    $$ = new_ast({
        value: $1,
        type: "enumeration_constant",
    });
}
;

character_constant
: CHARACTER_CONSTANT {
    $$ = new_ast({
        value: $1,
        type: "character_constant",
    });
}
;

string_literal
: STRING_LITERAL {
    $$ = new_ast({
        value: $1,
        type: "string_literal",
    });
}
;

/* 6.3 Expressions */
primary_expression
: identifier {
    $$ = new_ast({
        identifier: $1,
    });
}
| floating_constant {
    $$ = new_ast({
        floating_constant: $1,
    });
}
| integer_constant {
    $$ = new_ast({
        integer_constant: $1,
    });
}
| character_constant {
    $$ = new_ast({
        character_constant: $1,
    });
}
| string_literal {
    $$ = new_ast({
        string_literal: $1,
    });
}
| left_paren expression right_paren {
    $$ = new_ast({
        expression: $2,
    });
}
;

postfix_expression
: primary_expression {
    $$ = new_ast({
        primary_expression: $1,
    });
}
| postfix_expression left_bracket expression right_bracket {
    $$ = new_ast({
        postfix_expression: $1,
        expression: $3,
        type: "array_access",
    });
}
| postfix_expression left_paren argument_expression_list_opt right_paren {
    $$ = new_ast({
        postfix_expression: $1,
        argument_expression_list: $3,
        type: "function_call",
    });
}
| postfix_expression period identifier {
    $$ = new_ast({
        postfix_expression: $1,
        identifier: $3,
        type: "member_access",
    });
}
| postfix_expression arrow identifier {
    $$ = new_ast({
        postfix_expression: $1,
        identifier: $3,
        type: "pointer_member_access",
    });
}
| postfix_expression increment {
    $$ = new_ast({
        postfix_expression: $1,
        type: "increment",
    });
}
| postfix_expression decrement {
    $$ = new_ast({
        postfix_expression: $1,
        type: "decrement",
    });
}
;

argument_expression_list_opt
: /* empty */ {
    $$ = [];
}
| argument_expression_list {
    $$ = $1;
}
;
argument_expression_list
: assignment_expression {
    $$ = [new_ast({
        assignment_expression: $1,
    })];
}
| argument_expression_list comma assignment_expression {
    $$ = [...$1, new_ast({
        assignment_expression: $3,
    })];
}
;

unary_expression
: postfix_expression {
    $$ = new_ast({
        postfix_expression: $1,
    });
}
| increment unary_expression {
    $$ = new_ast({
        unary_expression: $2,
        type: "pre_increment",
    });
}
| decrement unary_expression {
    $$ = new_ast({
        unary_expression: $2,
        type: "pre_decrement",
    });
}
| unary_operator cast_expression {
    $$ = new_ast({
        unary_operator: $1,
        cast_expression: $2,
    });
}
| sizeof unary_expression {
    $$ = new_ast({
        unary_expression: $2,
        type: "sizeof_expression",
    });
}
| sizeof left_paren type_name right_paren {
    $$ = new_ast({
        type_name: $3,
        type: "sizeof_type",
    });
}
;
unary_operator
: ampersand {
    $$ = "address_of";
}
| asterisk {
    $$ = "indirection";
}
| plus {
    $$ = "unary_plus";
}
| minus {
    $$ = "unary_minus";
}
| tilde {
    $$ = "bitwise_not";
}
| exclamation {
    $$ = "logical_not";
}
;

cast_expression
: unary_expression {
    $$ = new_ast({
        unary_expression: $1,
    });
}
| left_paren type_name right_paren cast_expression {
    $$ = new_ast({
        type_name: $2,
        cast_expression: $4,
        type: "cast",
    });
}
;

multiplicative_expression
: cast_expression {
    $$ = new_ast({
        cast_expression: $1,
    });
}
| multiplicative_expression asterisk cast_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "multiplication",
    });
}
| multiplicative_expression slash cast_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "division",
    });
}
| multiplicative_expression percent cast_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "modulo",
    });
}
;

additive_expression
: multiplicative_expression {
    $$ = new_ast({
        multiplicative_expression: $1,
    });
}
| additive_expression plus multiplicative_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "addition",
    });
}
| additive_expression minus multiplicative_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "subtraction",
    });
}
;

shift_expression
: additive_expression {
    $$ = new_ast({
        additive_expression: $1,
    });
}
| shift_expression left_shift additive_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "left_shift",
    });
}
| shift_expression right_shift additive_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "right_shift",
    });
}
;

relational_expression
: shift_expression {
    $$ = new_ast({
        shift_expression: $1,
    });
}
| relational_expression less_than shift_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "less_than",
    });
}
| relational_expression greater_than shift_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "greater_than",
    });
}
| relational_expression less_equal shift_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "less_equal",
    });
}
| relational_expression greater_equal shift_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "greater_equal",
    });
}
;

equality_expression
: relational_expression {
    $$ = new_ast({
        relational_expression: $1,
    });
}
| equality_expression equal relational_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "equal",
    });
}
| equality_expression not_equal relational_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "not_equal",
    });
}
;

and_expression
: equality_expression {
    $$ = new_ast({
        equality_expression: $1,
    });
}
| and_expression ampersand equality_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "bitwise_and",
    });
}
;

exclusive_or_expression
: and_expression {
    $$ = new_ast({
        and_expression: $1,
    });
}
| exclusive_or_expression caret and_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "bitwise_xor",
    });
}
;

inclusive_or_expression
: exclusive_or_expression {
    $$ = new_ast({
        exclusive_or_expression: $1,
    });
}
| inclusive_or_expression bar exclusive_or_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "bitwise_or",
    });
}
;

logical_and_expression
: inclusive_or_expression {
    $$ = new_ast({
        inclusive_or_expression: $1,
    });
}
| logical_and_expression and inclusive_or_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "logical_and",
    });
}
;

logical_or_expression
: logical_and_expression {
    $$ = new_ast({
        logical_and_expression: $1,
    });
}
| logical_or_expression or logical_and_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "logical_or",
    });
}
;

conditional_expression
: logical_or_expression {
    $$ = new_ast({
        logical_or_expression: $1,
    });
}
| logical_or_expression question expression colon conditional_expression {
    $$ = new_ast({
        condition: $1,
        true_expression: $3,
        false_expression: $5,
        type: "ternary",
    });
}
;

assignment_expression
: conditional_expression {
    $$ = new_ast({
        conditional_expression: $1,
    });
}
| unary_expression assignment_operator assignment_expression {
    $$ = new_ast({
        left: $1,
        operator: $2,
        right: $3,
        type: "assignment",
    });
}
;

assignment_operator
: assign {
    $$ = "assign";
}
| asterisk_assign {
    $$ = "multiply_assign";
}
| slash_assign {
    $$ = "divide_assign";
}
| percent_assign {
    $$ = "modulo_assign";
}
| plus_assign {
    $$ = "add_assign";
}
| minus_assign {
    $$ = "subtract_assign";
}
| left_shift_assign {
    $$ = "left_shift_assign";
}
| right_shift_assign {
    $$ = "right_shift_assign";
}
| ampersand_assign {
    $$ = "bitwise_and_assign";
}
| caret_assign {
    $$ = "bitwise_xor_assign";
}
| bar_assign {
    $$ = "bitwise_or_assign";
}
;

expression_opt
: /* empty */ {
    $$ = null;
}
| expression {
    $$ = $1;
}
;
expression
: assignment_expression {
    $$ = new_ast({
        assignment_expression: $1,
    });
}
| expression comma assignment_expression {
    $$ = new_ast({
        left: $1,
        right: $3,
        type: "comma",
    });
}
;

/* 6.4 Constant expressions */
constant_expression_opt
: /* empty */ {
    $$ = null;
}
| constant_expression {
    $$ = $1;
}
;
constant_expression
: conditional_expression {
    $$ = new_ast({
        conditional_expression: $1,
    });
}
;

/* 6.5 Declarations */
declaration
: declaration_specifiers init_declarator_list_opt semicolon {
    $$ = new_ast({
        declaration_specifiers: $1,
        init_declarator_list: $2,
    });
}
;

declaration_specifiers
: declaration_specifier {
    $$ = [new_ast({
        declaration_specifier: $1,
    })];
}
| declaration_specifiers declaration_specifier {
    $$ = [...$1, new_ast({
        declaration_specifier: $2,
    })];
}
;

declaration_specifier
: storage_class_specifier {
    $$ = new_ast({
        storage_class_specifier: $1,
    });
}
| type_specifier {
    $$ = new_ast({
        type_specifier: $1,
    });
}
| type_qualifier {
    $$ = new_ast({
        type_qualifier: $1,
    });
}
;

init_declarator_list_opt
: /* empty */ {
    $$ = [];
}
| init_declarator_list {
    $$ = $1;
}
;
init_declarator_list
: init_declarator {
    $$ = [new_ast({
        init_declarator: $1,
    })];
}
| init_declarator_list comma init_declarator {
    $$ = [...$1, new_ast({
        init_declarator: $3,
    })];
}
;

init_declarator
: declarator {
    $$ = new_ast({
        declarator: $1,
        initializer: null,
    });
}
| declarator assign initializer {
    $$ = new_ast({
        declarator: $1,
        initializer: $3,
    });
}
;

storage_class_specifier
: typedef {
    $$ = new_ast({
        typedef: $1,
    });
}
| extern {
    $$ = new_ast({
        extern: $1,
    });
}
| static {
    $$ = new_ast({
        static: $1,
    });
}
| auto {
    $$ = new_ast({
        auto: $1,
    });
}
| register {
    $$ = new_ast({
        register: $1,
    });
}
;

type_specifier
: void {
    $$ = new_ast({
        void: $1,
    });
}
| char {
    $$ = new_ast({
        char: $1,
    });
}
| short {
    $$ = new_ast({
        short: $1,
    });
}
| int {
    $$ = new_ast({
        int: $1,
    });
}
| long {
    $$ = new_ast({
        long: $1,
    });
}
| float {
    $$ = new_ast({
        float: $1,
    });
}
| double {
    $$ = new_ast({
        double: $1,
    });
}
| signed {
    $$ = new_ast({
        signed: $1,
    });
}
| unsigned {
    $$ = new_ast({
        unsigned: $1,
    });
}
| struct_or_union_specifier {
    $$ = new_ast({
        struct_or_union_specifier: $1,
    });
}
| enum_specifier {
    $$ = new_ast({
        enum_specifier: $1,
    });
}
| typedef_name {
    $$ = new_ast({
        typedef_name: $1,
    });
}
;

struct_or_union_specifier
: struct_or_union identifier_opt left_brace struct_declaration_list right_brace {
    $$ = new_ast({
        struct_or_union: $1,
        identifier: $2,
        struct_declaration_list: $4,
    });
}
| struct_or_union identifier {
    $$ = new_ast({
        struct_or_union: $1,
        identifier: $2,
    });
}
;

struct_or_union
: struct {
    $$ = new_ast({
        struct: $1,
    });
}
| union {
    $$ = new_ast({
        union: $1,
    });
}
;

struct_declaration_list
: struct_declaration {
    $$ = [new_ast({
        struct_declaration: $1,
    })];
}
| struct_declaration_list struct_declaration {
    $$ = [...$1, new_ast({
        struct_declaration: $2,
    })];
}
;

struct_declaration
: specifier_qualifier_list struct_declarator_list semicolon {
    $$ = new_ast({
        specifier_qualifier_list: $1,
        struct_declarator_list: $2,
    });
}
;

specifier_qualifier_list
: specifier_qualifier {
    $$ = [new_ast({
        specifier_qualifier: $1,
    })];
}
| specifier_qualifier_list specifier_qualifier {
    $$ = [...$1, new_ast({
        specifier_qualifier: $2,
    })];
}
;

specifier_qualifier
: type_specifier {
    $$ = new_ast({
        type_specifier: $1,
    });
}
| type_qualifier {
    $$ = new_ast({
        type_qualifier: $1,
    });
}
;

struct_declarator_list
: struct_declarator {
    $$ = [new_ast({
        struct_declarator: $1,
    })];
}
| struct_declarator_list comma struct_declarator {
    $$ = [...$1, new_ast({
        struct_declarator: $3,
    })];
}
;

struct_declarator
: declarator {
    $$ = new_ast({
        declarator: $1,
        constant_expression: null,
    });
}
| declarator_opt colon constant_expression {
    $$ = new_ast({
        declarator: $1,
        constant_expression: $3,
    });
}
;

enum_specifier
: enum identifier_opt left_brace enumerator_list right_brace {
    $$ = new_ast({
        enum: $1,
        identifier: $2,
        enumerator_list: $4,
    });
}
| enum identifier {
    $$ = new_ast({
        enum: $1,
        identifier: $2,
    });
}
;

enumerator_list
: enumerator {
    $$ = [new_ast({
        enumerator: $1,
    })];
}
| enumerator_list comma enumerator {
    $$ = [...$1, new_ast({
        enumerator: $3,
    })];
}
;

enumerator
: enumeration_constant {
    $$ = new_ast({
        enumeration_constant: $1,
        constant_expression: null,
    });
}
| enumeration_constant assign constant_expression {
    $$ = new_ast({
        enumeration_constant: $1,
        constant_expression: $3,
    });
}
;

type_qualifier
: const {
    $$ = new_ast({
        const: $1,
    });
}
| volatile {
    $$ = new_ast({
        volatile: $1,
    });
}
;

declarator_opt
: /* empty */ {
    $$ = new_ast({
        pointer: null,
        direct_declarator: null,
    });
}
| declarator {
    $$ = $1;
}
;
declarator
: direct_declarator {
    $$ = new_ast({
        pointer: null,
        direct_declarator: $1,
    });
}
| pointer direct_declarator {
    $$ = new_ast({
        pointer: $1,
        direct_declarator: $2,
    });
}
;

direct_declarator
: identifier {
    $$ = new_ast({
        identifier: $1,
    });
}
| left_paren declarator right_paren {
    $$ = new_ast({
        declarator: $2,
    });
}
| direct_declarator left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        direct_declarator: $1,
        constant_expression: $3,
    });
}
| direct_declarator left_paren parameter_type_list right_paren {
    $$ = new_ast({
        direct_declarator: $1,
        parameter_type_list: $3,
    });
}
| direct_declarator left_paren identifier_list_opt right_paren {
    $$ = new_ast({
        direct_declarator: $1,
        identifier_list: $3,
    });
}
;

pointer
: asterisk type_qualifier_list_opt {
    $$ = new_ast({
        pointer: null,
        asterisk: $1,
        type_qualifier_list: $2,
    });
}
| pointer asterisk type_qualifier_list_opt {
    $$ = new_ast({
        pointer: $1,
        asterisk: $2,
        type_qualifier_list: $3,
    });
}
;

type_qualifier_list_opt
: /* empty */ {
    $$ = [];
}
| type_qualifier_list {
    $$ = $1;
}
;
type_qualifier_list
: type_qualifier {
    $$ = [new_ast({
        type_qualifier: $1,
    })];
}
| type_qualifier_list type_qualifier {
    $$ = [...$1, new_ast({
        type_qualifier: $2,
    })];
}
;

parameter_type_list_opt
: /* empty */ {
    $$ = new_ast({
        parameter_list: [],
    });
}
| parameter_type_list {
    $$ = $1;
}
;
parameter_type_list
: parameter_list {
    $$ = new_ast({
        parameter_list: $1,
    });
}
| parameter_list comma ellipsis {
    $$ = new_ast({
        parameter_list: $1,
        ellipsis: $3,
    });
}
;
parameter_list
: parameter_declaration {
    $$ = [new_ast({
        parameter_declaration: $1,
    })];
}
| parameter_list comma parameter_declaration {
    $$ = [...$1, new_ast({
        parameter_declaration: $3,
    })];
}
;

parameter_declaration
: declaration_specifiers declarator {
    $$ = new_ast({
        declaration_specifiers: $1,
        declarator: $2,
    });
}
| declaration_specifiers abstract_declarator_opt {
    $$ = new_ast({
        declaration_specifiers: $1,
        abstract_declarator: $2,
    });
}
;

identifier_list_opt
: /* empty */ {
    $$ = [];
}
| identifier_list {
    $$ = $1;
}
;
identifier_list
: identifier {
    $$ = [new_ast({
        identifier: $1,
    })];
}
| identifier_list comma identifier {
    $$ = [...$1, new_ast({
        identifier: $3,
    })];
}
;

type_name
: specifier_qualifier_list abstract_declarator_opt {
    $$ = new_ast({
        specifier_qualifier_list: $1,
        abstract_declarator: $2,
    });
}
;

abstract_declarator_opt
: /* empty */ {
    $$ = null;
}
| abstract_declarator {
    $$ = $1;
}
;
abstract_declarator
: pointer {
    $$ = new_ast({
        pointer: $1,
        direct_abstract_declarator: null,
    });
}
| direct_abstract_declarator {
    $$ = new_ast({
        pointer: null,
        direct_abstract_declarator: $1,
    });
}
| pointer direct_abstract_declarator {
    $$ = new_ast({
        pointer: $1,
        direct_abstract_declarator: $2,
    });
}
;

direct_abstract_declarator
: left_paren abstract_declarator right_paren {
    $$ = new_ast({
        abstract_declarator: $2,
    });
}
| left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        direct_abstract_declarator: null,
        constant_expression: $2,
    });
}
| direct_abstract_declarator left_bracket constant_expression_opt right_bracket {
    $$ = new_ast({
        direct_abstract_declarator: $1,
        constant_expression: $3,
    });
}
| left_paren parameter_type_list_opt right_paren {
    $$ = new_ast({
        direct_abstract_declarator: null,
        parameter_type_list: $2,
    });
}
| direct_abstract_declarator left_paren parameter_type_list_opt right_paren {
    $$ = new_ast({
        direct_abstract_declarator: $1,
        parameter_type_list: $3,
    });
}
;

typedef_name
: typedef_identifier {
    $$ = new_ast({
        typedef_identifier: $1,
    });
}
;

initializer
: assignment_expression {
    $$ = new_ast({
        assignment_expression: $1,
    });
}
| left_brace initializer_list right_brace {
    $$ = new_ast({
        initializer_list: $2,
    });
}
| left_brace initializer_list comma right_brace {
    $$ = new_ast({
        initializer_list: $2,
    });
}
;

initializer_list
: initializer {
    $$ = [new_ast({
        initializer: $1,
    })];
}
| initializer_list comma initializer {
    $$ = [...$1, new_ast({
        initializer: $3,
    })];
}
;

/* 6.6 Statements */
statement
: labeled_statement {
    $$ = new_ast({
        labeled_statement: $1,
    });
}
| compound_statement {
    $$ = new_ast({
        compound_statement: $1,
    });
}
| expression_statement {
    $$ = new_ast({
        expression_statement: $1,
    });
}
| selection_statement {
    $$ = {
        selection_statement: $1,
    };
}
| iteration_statement {
    $$ = new_ast({
        iteration_statement: $1,
    });
}
| jump_statement {
    $$ = new_ast({
        jump_statement: $1,
    });
}
;

labeled_statement
: identifier colon statement {
    $$ = new_ast({
        identifier: $1,
        statement: $3,
    });
}
| case constant_expression colon statement {
    $$ = new_ast({
        case: $1,
        constant_expression: $2,
        statement: $4,
    });
}
| default colon statement {
    $$ = new_ast({
        default: $1,
        statement: $3,
    });
}
;

compound_statement
: left_brace declaration_list_opt statement_list_opt right_brace {
    $$ = new_ast({
        declaration_list: $2,
        statement_list: $3,
    });
}
;

declaration_list_opt
: /* empty */ {
    $$ = [];
}
| declaration_list {
    $$ = $1;
}
;
declaration_list
: declaration {
    $$ = [new_ast({
        declaration: $1,
    })];
}
| declaration_list declaration {
    $$ = [...$1, new_ast({
        declaration: $2,
    })];
}
;

statement_list_opt
: /* empty */ {
    $$ = [];
}
| statement_list {
    $$ = $1;
}
;
statement_list
: statement {
    $$ = [new_ast({
        statement: $1,
    })];
}
| statement_list statement {
    $$ = [...$1, new_ast({
        statement: $2,
    })];
}
;

expression_statement
: expression_opt semicolon {
    $$ = new_ast({
        expression: $1,
    });
}
;

selection_statement
: if left_paren expression right_paren statement %prec THEN {
    $$ = new_ast({
        if: $1,
        expression: $3,
        then: $5,
    });
}
| if left_paren expression right_paren statement else statement {
    $$ = new_ast({
        if: $1,
        expression: $3,
        then: $5,
        else: $7,
    });
}
| switch left_paren expression right_paren statement {
    $$ = new_ast({
        switch: $1,
        expression: $3,
        statement: $5,
    });
}
;

iteration_statement
: while left_paren expression right_paren statement {
    $$ = new_ast({
        while: $1,
        expression: $3,
        statement: $5,
    });
}
| do statement while left_paren expression right_paren semicolon {
    $$ = new_ast({
        do: $1,
        statement: $2,
        expression: $5,
    });
}
| for left_paren expression_opt semicolon expression_opt semicolon expression_opt right_paren statement {
    $$ = new_ast({
        for: $1,
        expression1: $3,
        expression2: $5,
        expression3: $7,
        statement: $9,
    });
}
;

jump_statement
: goto identifier semicolon {
    $$ = new_ast({
        goto: $1,
        identifier: $2,
    });
}
| continue semicolon {
    $$ = new_ast({
        continue: $1,
    });
}
| break semicolon {
    $$ = new_ast({
        break: $1,
    });
}
| return expression_opt semicolon {
    $$ = new_ast({
        return: $1,
        expression: $2,
    });
}
;

/* 6.7 External definitions */
translation_unit
: external_declaration {
    $$ = [new_ast({
        external_declaration: $1,
    })];
}
| translation_unit external_declaration {
    $$ = [...$1, new_ast({
        external_declaration: $2,
    })];
}
;

external_declaration
: function_definition {
    $$ = new_ast({
        function_definition: $1,
    });
}
| declaration {
    $$ = new_ast({
        declaration: $1,
    });
}
;

function_definition
: declarator declaration_list_opt compound_statement {
    $$ = new_ast({
        declaration_specifiers: [],
        declarator: $1,
        declaration_list: $2,
        compound_statement: $3,
    });
}
| declaration_specifiers declarator declaration_list_opt compound_statement {
    $$ = new_ast({
        declaration_specifiers: $1,
        declarator: $2,
        declaration_list: $3,
        compound_statement: $4,
    });
}
;
