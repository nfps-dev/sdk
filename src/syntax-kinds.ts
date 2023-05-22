import type {
	EndOfFileToken,
	NumericLiteral,
	BigIntLiteral,
	StringLiteral,
	JsxText,
	RegularExpressionLiteral,
	NoSubstitutionTemplateLiteral,
	TemplateHead,
	TemplateMiddle,
	TemplateTail,
	DotToken,
	DotDotDotToken,
	QuestionDotToken,
	EqualsGreaterThanToken,
	PlusToken,
	MinusToken,
	AsteriskToken,
	ExclamationToken,
	QuestionToken,
	ColonToken,
	EqualsToken,
	BarBarEqualsToken,
	AmpersandAmpersandEqualsToken,
	QuestionQuestionEqualsToken,
	Identifier,
	PrivateIdentifier,

	ComputedPropertyName,
	QualifiedName,
	TypeParameter,
	Decorator,
	PropertySignature,
	PropertyDeclaration,
	MethodSignature,
	MethodDeclaration,
	ClassStaticBlockDeclaration,
	TypePredicate,
	TypeReference,
	TupleType,
	UnionType,
	IntersectionType,
	ConditionalType,
	IndexedAccessType,
	LiteralType,
	NamedTupleMember,
	TemplateLiteralType,
	TemplateLiteralTypeSpan,
	ObjectBindingPattern,
	ArrayBindingPattern,
	BindingElement,
	ArrayLiteralExpression,
	ObjectLiteralExpression,
	PropertyAccessExpression,
	ElementAccessExpression,
	CallExpression,
	NewExpression,
	TaggedTemplateExpression,
	ParenthesizedExpression,
	FunctionExpression,
	ArrowFunction,
	DeleteExpression,
	TypeOfExpression,
	VoidExpression,
	AwaitExpression,
	PrefixUnaryExpression,
	PostfixUnaryExpression,
	BinaryExpression,
	ConditionalExpression,
	TemplateExpression,
	YieldExpression,
	SpreadElement,
	ClassExpression,
	OmittedExpression,
	ExpressionWithTypeArguments,
	AsExpression,
	NonNullExpression,
	MetaProperty,
	SyntheticExpression,
	SatisfiesExpression,
	TemplateSpan,
	SemicolonClassElement,
	Block,
	EmptyStatement,
	VariableStatement,
	ExpressionStatement,
	IfStatement,
	DoStatement,
	WhileStatement,
	ForStatement,
	ForInStatement,
	ForOfStatement,
	ContinueStatement,
	BreakStatement,
	ReturnStatement,
	WithStatement,
	SwitchStatement,
	LabeledStatement,
	ThrowStatement,
	TryStatement,
	DebuggerStatement,
	VariableDeclaration,
	VariableDeclarationList,
	FunctionDeclaration,
	ClassDeclaration,
	InterfaceDeclaration,
	TypeAliasDeclaration,
	EnumDeclaration,
	ModuleDeclaration,
	ModuleBlock,
	CaseBlock,
	NamespaceExportDeclaration,
	ImportEqualsDeclaration,
	ImportDeclaration,
	ImportClause,
	NamespaceImport,
	NamedImports,
	ImportSpecifier,
	ExportAssignment,
	ExportDeclaration,
	NamedExports,
	NamespaceExport,
	ExportSpecifier,
	MissingDeclaration,
	ExternalModuleReference,
	JsxElement,
	JsxSelfClosingElement,
	JsxOpeningElement,
	JsxClosingElement,
	JsxFragment,
	JsxOpeningFragment,
	JsxClosingFragment,
	JsxAttribute,
	JsxAttributes,
	JsxSpreadAttribute,
	JsxExpression,
	CaseClause,
	DefaultClause,
	HeritageClause,
	CatchClause,
	AssertClause,
	AssertEntry,
	ImportTypeAssertionContainer,
	PropertyAssignment,
	ShorthandPropertyAssignment,
	SpreadAssignment,
	EnumMember,
	UnparsedPrologue,
	UnparsedPrepend,
	UnparsedSyntheticReference,
	SourceFile,
	Bundle,
	UnparsedSource,
	InputFiles,
	JSDocTypeExpression,
	JSDocNameReference,
	JSDocMemberName,
	JSDocAllType,
	JSDocUnknownType,
	JSDocNullableType,
	JSDocNonNullableType,
	JSDocOptionalType,
	JSDocFunctionType,
	JSDocVariadicType,
	JSDocNamepathType,
	JSDocText,
	JSDocTypeLiteral,
	JSDocSignature,
	JSDocLink,
	JSDocLinkCode,
	JSDocLinkPlain,
	JSDocTag,
	JSDocAugmentsTag,
	JSDocImplementsTag,
	JSDocAuthorTag,
	JSDocDeprecatedTag,
	JSDocClassTag,
	JSDocPublicTag,
	JSDocPrivateTag,
	JSDocProtectedTag,
	JSDocReadonlyTag,
	JSDocOverrideTag,
	JSDocCallbackTag,
	JSDocOverloadTag,
	JSDocEnumTag,
	JSDocParameterTag,
	JSDocReturnTag,
	JSDocThisTag,
	JSDocTypeTag,
	JSDocTemplateTag,
	JSDocTypedefTag,
	JSDocSeeTag,
	JSDocPropertyTag,
	JSDocThrowsTag,
	JSDocSatisfiesTag,
	SyntaxList,
	NotEmittedStatement,
	PartiallyEmittedExpression,
	CommaListExpression,
} from 'typescript';

export type SyntaxKindLookup = {
	// 0: Unknown;
	1: EndOfFileToken;
	8: NumericLiteral;
	9: BigIntLiteral;
	10: StringLiteral;
	11: JsxText;
	13: RegularExpressionLiteral;
	14: NoSubstitutionTemplateLiteral;
	15: TemplateHead;
	16: TemplateMiddle;
	17: TemplateTail;
	24: DotToken;
	25: DotDotDotToken;
	28: QuestionDotToken;
	38: EqualsGreaterThanToken;
	39: PlusToken;
	40: MinusToken;
	41: AsteriskToken;
	53: ExclamationToken;
	57: QuestionToken;
	58: ColonToken;
	63: EqualsToken;
	75: BarBarEqualsToken;
	76: AmpersandAmpersandEqualsToken;
	77: QuestionQuestionEqualsToken;
	79: Identifier;
	80: PrivateIdentifier;

	// 81: BreakKeyword;
	// 82: CaseKeyword;
	// 83: CatchKeyword;
	// 84: ClassKeyword;
	// 85: ConstKeyword;
	// 86: ContinueKeyword;
	// 87: DebuggerKeyword;
	// 88: DefaultKeyword;
	// 89: DeleteKeyword;
	// 90: DoKeyword;
	// 91: ElseKeyword;
	// 92: EnumKeyword;
	// 93: ExportKeyword;
	// 94: ExtendsKeyword;
	// 95: FalseKeyword;
	// 96: FinallyKeyword;
	// 97: ForKeyword;
	// 98: FunctionKeyword;
	// 99: IfKeyword;
	// 100: ImportKeyword;
	// 101: InKeyword;
	// 102: InstanceOfKeyword;
	// 103: NewKeyword;
	// 104: NullKeyword;
	// 105: ReturnKeyword;
	// 106: SuperKeyword;
	// 107: SwitchKeyword;
	// 108: ThisKeyword;
	// 109: ThrowKeyword;
	// 110: TrueKeyword;
	// 111: TryKeyword;
	// 112: TypeOfKeyword;
	// 113: VarKeyword;
	// 114: VoidKeyword;
	// 115: WhileKeyword;
	// 116: WithKeyword;
	// 117: ImplementsKeyword;
	// 118: InterfaceKeyword;
	// 119: LetKeyword;
	// 120: PackageKeyword;
	// 121: PrivateKeyword;
	// 122: ProtectedKeyword;
	// 123: PublicKeyword;
	// 124: StaticKeyword;
	// 125: YieldKeyword;
	// 126: AbstractKeyword;
	// 127: AccessorKeyword;
	// 128: AsKeyword;
	// 129: AssertsKeyword;
	// 130: AssertKeyword;
	// 131: AnyKeyword;
	// 132: AsyncKeyword;
	// 133: AwaitKeyword;
	// 134: BooleanKeyword;
	// 135: ConstructorKeyword;
	// 136: DeclareKeyword;
	// 137: GetKeyword;
	// 138: InferKeyword;
	// 139: IntrinsicKeyword;
	// 140: IsKeyword;
	// 141: KeyOfKeyword;
	// 142: ModuleKeyword;
	// 143: NamespaceKeyword;
	// 144: NeverKeyword;
	// 145: OutKeyword;
	// 146: ReadonlyKeyword;
	// 147: RequireKeyword;
	// 148: NumberKeyword;
	// 149: ObjectKeyword;
	// 150: SatisfiesKeyword;
	// 151: SetKeyword;
	// 152: StringKeyword;
	// 153: SymbolKeyword;
	// 154: TypeKeyword;
	// 155: UndefinedKeyword;
	// 156: UniqueKeyword;
	// 157: UnknownKeyword;
	// 158: FromKeyword;
	// 159: GlobalKeyword;
	// 160: BigIntKeyword;
	// 161: OverrideKeyword;
	// 162: OfKeyword;

	163: QualifiedName;
	164: ComputedPropertyName;
	165: TypeParameter;
	167: Decorator;
	168: PropertySignature;
	169: PropertyDeclaration;
	170: MethodSignature;
	171: MethodDeclaration;
	172: ClassStaticBlockDeclaration;
	179: TypePredicate;
	180: TypeReference;
	186: TupleType;
	189: UnionType;
	190: IntersectionType;
	191: ConditionalType;
	196: IndexedAccessType;
	198: LiteralType;
	199: NamedTupleMember;
	200: TemplateLiteralType;
	201: TemplateLiteralTypeSpan;
	203: ObjectBindingPattern;
	204: ArrayBindingPattern;
	205: BindingElement;
	206: ArrayLiteralExpression;
	207: ObjectLiteralExpression;
	208: PropertyAccessExpression;
	209: ElementAccessExpression;
	210: CallExpression;
	211: NewExpression;
	212: TaggedTemplateExpression;
	214: ParenthesizedExpression;
	215: FunctionExpression;
	216: ArrowFunction;
	217: DeleteExpression;
	218: TypeOfExpression;
	219: VoidExpression;
	220: AwaitExpression;
	221: PrefixUnaryExpression;
	222: PostfixUnaryExpression;
	223: BinaryExpression;
	224: ConditionalExpression;
	225: TemplateExpression;
	226: YieldExpression;
	227: SpreadElement;
	228: ClassExpression;
	229: OmittedExpression;
	230: ExpressionWithTypeArguments;
	231: AsExpression;
	232: NonNullExpression;
	233: MetaProperty;
	234: SyntheticExpression;
	235: SatisfiesExpression;
	236: TemplateSpan;
	237: SemicolonClassElement;
	238: Block;
	239: EmptyStatement;
	240: VariableStatement;
	241: ExpressionStatement;
	242: IfStatement;
	243: DoStatement;
	244: WhileStatement;
	245: ForStatement;
	246: ForInStatement;
	247: ForOfStatement;
	248: ContinueStatement;
	249: BreakStatement;
	250: ReturnStatement;
	251: WithStatement;
	252: SwitchStatement;
	253: LabeledStatement;
	254: ThrowStatement;
	255: TryStatement;
	256: DebuggerStatement;
	257: VariableDeclaration;
	258: VariableDeclarationList;
	259: FunctionDeclaration;
	260: ClassDeclaration;
	261: InterfaceDeclaration;
	262: TypeAliasDeclaration;
	263: EnumDeclaration;
	264: ModuleDeclaration;
	265: ModuleBlock;
	266: CaseBlock;
	267: NamespaceExportDeclaration;
	268: ImportEqualsDeclaration;
	269: ImportDeclaration;
	270: ImportClause;
	271: NamespaceImport;
	272: NamedImports;
	273: ImportSpecifier;
	274: ExportAssignment;
	275: ExportDeclaration;
	276: NamedExports;
	277: NamespaceExport;
	278: ExportSpecifier;
	279: MissingDeclaration;
	280: ExternalModuleReference;
	281: JsxElement;
	282: JsxSelfClosingElement;
	283: JsxOpeningElement;
	284: JsxClosingElement;
	285: JsxFragment;
	286: JsxOpeningFragment;
	287: JsxClosingFragment;
	288: JsxAttribute;
	289: JsxAttributes;
	290: JsxSpreadAttribute;
	291: JsxExpression;
	292: CaseClause;
	293: DefaultClause;
	294: HeritageClause;
	295: CatchClause;
	296: AssertClause;
	297: AssertEntry;
	298: ImportTypeAssertionContainer;
	299: PropertyAssignment;
	300: ShorthandPropertyAssignment;
	301: SpreadAssignment;
	302: EnumMember;
	303: UnparsedPrologue;
	304: UnparsedPrepend;
	307: UnparsedSyntheticReference;
	308: SourceFile;
	309: Bundle;
	310: UnparsedSource;
	311: InputFiles;
	312: JSDocTypeExpression;
	313: JSDocNameReference;
	314: JSDocMemberName;
	315: JSDocAllType;
	316: JSDocUnknownType;
	317: JSDocNullableType;
	318: JSDocNonNullableType;
	319: JSDocOptionalType;
	320: JSDocFunctionType;
	321: JSDocVariadicType;
	322: JSDocNamepathType;
	324: JSDocText;
	325: JSDocTypeLiteral;
	326: JSDocSignature;
	327: JSDocLink;
	328: JSDocLinkCode;
	329: JSDocLinkPlain;
	330: JSDocTag;
	331: JSDocAugmentsTag;
	332: JSDocImplementsTag;
	333: JSDocAuthorTag;
	334: JSDocDeprecatedTag;
	335: JSDocClassTag;
	336: JSDocPublicTag;
	337: JSDocPrivateTag;
	338: JSDocProtectedTag;
	339: JSDocReadonlyTag;
	340: JSDocOverrideTag;
	341: JSDocCallbackTag;
	342: JSDocOverloadTag;
	343: JSDocEnumTag;
	344: JSDocParameterTag;
	345: JSDocReturnTag;
	346: JSDocThisTag;
	347: JSDocTypeTag;
	348: JSDocTemplateTag;
	349: JSDocTypedefTag;
	350: JSDocSeeTag;
	351: JSDocPropertyTag;
	352: JSDocThrowsTag;
	353: JSDocSatisfiesTag;
	354: SyntaxList;
	355: NotEmittedStatement;
	356: PartiallyEmittedExpression;
	357: CommaListExpression;

	// 63: FirstAssignment;
	// 78: LastAssignment;
	// 64: FirstCompoundAssignment;
	// 78: LastCompoundAssignment;
	// 81: FirstReservedWord;
	// 116: LastReservedWord;
	// 81: FirstKeyword;
	// 162: LastKeyword;
	// 117: FirstFutureReservedWord;
	// 125: LastFutureReservedWord;
	// 179: FirstTypeNode;
	// 202: LastTypeNode;
	// 18: FirstPunctuation;
	// 78: LastPunctuation;
	// 0: FirstToken;
	// 162: LastToken;
	// 2: FirstTriviaToken;
	// 7: LastTriviaToken;
	// 8: FirstLiteralToken;
	// 14: LastLiteralToken;
	// 14: FirstTemplateToken;
	// 17: LastTemplateToken;
	// 29: FirstBinaryOperator;
	// 78: LastBinaryOperator;
	// 240: FirstStatement;
	// 256: LastStatement;
	// 163: FirstNode;
	// 312: FirstJSDocNode;
	// 353: LastJSDocNode;
	// 330: FirstJSDocTagNode;
	// 353: LastJSDocTagNode;
};
