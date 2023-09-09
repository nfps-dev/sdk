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
	// 2: SingleLineCommentTrivia;
	// 3: MultiLineCommentTrivia;
	// 4: NewLineTrivia;
	// 5: WhitespaceTrivia;
	// 6: ShebangTrivia;
	// 7: ConflictMarkerTrivia;
	// 8: NonTextFileMarkerTrivia;
	9: NumericLiteral;
	10: BigIntLiteral;
	11: StringLiteral;
	12: JsxText;
	// 13: JsxTextAllWhiteSpaces;
	14: RegularExpressionLiteral;
	15: NoSubstitutionTemplateLiteral;
	16: TemplateHead;
	17: TemplateMiddle;
	18: TemplateTail;
	// 19: OpenBraceToken;
	// 20: CloseBraceToken;
	// 21: OpenParenToken;
	// 22: CloseParenToken;
	// 23: OpenBracketToken;
	// 24: CloseBracketToken;
	25: DotToken;
	26: DotDotDotToken;
	// 27: SemicolonToken;
	// 28: CommaToken;
	29: QuestionDotToken;
	// 30: LessThanToken;
	// 31: LessThanSlashToken;
	// 32: GreaterThanToken;
	// 33: LessThanEqualsToken;
	// 34: GreaterThanEqualsToken;
	// 35: EqualsEqualsToken;
	// 36: ExclamationEqualsToken;
	// 37: EqualsEqualsEqualsToken;
	// 38: ExclamationEqualsEqualsToken;
	39: EqualsGreaterThanToken;
	40: PlusToken;
	41: MinusToken;
	42: AsteriskToken;
	// 43: AsteriskAsteriskToken;
	// 44: SlashToken;
	// 45: PercentToken;
	// 46: PlusPlusToken;
	// 47: MinusMinusToken;
	// 48: LessThanLessThanToken;
	// 49: GreaterThanGreaterThanToken;
	// 50: GreaterThanGreaterThanGreaterThanToken;
	// 51: AmpersandToken;
	// 52: BarToken;
	// 53: CaretToken;
	54: ExclamationToken;
	// 55: TildeToken;
	// 56: AmpersandAmpersandToken;
	// 57: BarBarToken;
	58: QuestionToken;
	59: ColonToken;
	// 60: AtToken;
	// 61: QuestionQuestionToken;

	// 62: BacktickToken;

	// 63: HashToken;
	64: EqualsToken;
	// 65: PlusEqualsToken;
	// 66: MinusEqualsToken;
	// 67: AsteriskEqualsToken;
	// 68: AsteriskAsteriskEqualsToken;
	// 69: SlashEqualsToken;
	// 70: PercentEqualsToken;
	// 71: LessThanLessThanEqualsToken;
	// 72: GreaterThanGreaterThanEqualsToken;
	// 73: GreaterThanGreaterThanGreaterThanEqualsToken;
	// 74: AmpersandEqualsToken;
	// 75: BarEqualsToken;
	76: BarBarEqualsToken;
	77: AmpersandAmpersandEqualsToken;
	78: QuestionQuestionEqualsToken;
	// 79: CaretEqualsToken;
	80: Identifier;
	81: PrivateIdentifier;

	// 83: BreakKeyword;
	// 84: CaseKeyword;
	// 85: CatchKeyword;
	// 86: ClassKeyword;
	// 87: ConstKeyword;
	// 88: ContinueKeyword;
	// 89: DebuggerKeyword;
	// 90: DefaultKeyword;
	// 91: DeleteKeyword;
	// 92: DoKeyword;
	// 93: ElseKeyword;
	// 94: EnumKeyword;
	// 95: ExportKeyword;
	// 96: ExtendsKeyword;
	// 97: FalseKeyword;
	// 98: FinallyKeyword;
	// 99: ForKeyword;
	// 100: FunctionKeyword;
	// 101: IfKeyword;
	// 102: ImportKeyword;
	// 103: InKeyword;
	// 104: InstanceOfKeyword;
	// 105: NewKeyword;
	// 106: NullKeyword;
	// 107: ReturnKeyword;
	// 108: SuperKeyword;
	// 109: SwitchKeyword;
	// 110: ThisKeyword;
	// 111: ThrowKeyword;
	// 112: TrueKeyword;
	// 113: TryKeyword;
	// 114: TypeOfKeyword;
	// 115: VarKeyword;
	// 116: VoidKeyword;
	// 117: WhileKeyword;
	// 118: WithKeyword;
	// 119: ImplementsKeyword;
	// 120: InterfaceKeyword;
	// 121: LetKeyword;
	// 122: PackageKeyword;
	// 123: PrivateKeyword;
	// 124: ProtectedKeyword;
	// 125: PublicKeyword;
	// 126: StaticKeyword;
	// 127: YieldKeyword;
	// 128: AbstractKeyword;
	// 129: AccessorKeyword;
	// 130: AsKeyword;
	// 131: AssertsKeyword;
	// 132: AssertKeyword;
	// 133: AnyKeyword;
	// 134: AsyncKeyword;
	// 135: AwaitKeyword;
	// 136: BooleanKeyword;
	// 137: ConstructorKeyword;
	// 138: DeclareKeyword;
	// 139: GetKeyword;
	// 140: InferKeyword;
	// 141: IntrinsicKeyword;
	// 142: IsKeyword;
	// 143: KeyOfKeyword;
	// 144: ModuleKeyword;
	// 145: NamespaceKeyword;
	// 146: NeverKeyword;
	// 147: OutKeyword;
	// 148: ReadonlyKeyword;
	// 149: RequireKeyword;
	// 150: NumberKeyword;
	// 151: ObjectKeyword;
	// 152: SatisfiesKeyword;
	// 153: SetKeyword;
	// 154: StringKeyword;
	// 155: SymbolKeyword;
	// 156: TypeKeyword;
	// 157: UndefinedKeyword;
	// 158: UniqueKeyword;
	// 159: UnknownKeyword;
	// 160: UsingKeyword;
	// 161: FromKeyword;
	// 162: GlobalKeyword;
	// 163: BigIntKeyword;
	// 164: OverrideKeyword;
	// 165: OfKeyword;

	166: QualifiedName;
	167: ComputedPropertyName;
	168: TypeParameter;
	// 169: Parameter;
	170: Decorator;
	171: PropertySignature;
	172: PropertyDeclaration;
	173: MethodSignature;
	174: MethodDeclaration;
	175: ClassStaticBlockDeclaration;
	// 176: Constructor;
	// 177: GetAccessor;
	// 178: SetAccessor;
	// 179: CallSignature;
	// 180: ConstructSignature;
	// 181: IndexSignature;
	182: TypePredicate;
	183: TypeReference;
	// 184: FunctionType;
	// 185: ConstructorType;
	// 186: TypeQuery;
	// 187: TypeLiteral;
	// 188: ArrayType;
	189: TupleType;
	// 190: OptionalType;
	// 191: RestType;
	192: UnionType;
	193: IntersectionType;
	194: ConditionalType;
	// 195: InferType;
	// 196: ParenthesizedType;
	// 197: ThisType;
	// 198: TypeOperator;
	199: IndexedAccessType;
	// 200: MappedType;
	201: LiteralType;
	202: NamedTupleMember;
	203: TemplateLiteralType;
	204: TemplateLiteralTypeSpan;
	// 205: ImportType;
	206: ObjectBindingPattern;
	207: ArrayBindingPattern;
	208: BindingElement;
	209: ArrayLiteralExpression;
	210: ObjectLiteralExpression;
	211: PropertyAccessExpression;
	212: ElementAccessExpression;
	213: CallExpression;
	214: NewExpression;
	215: TaggedTemplateExpression;
	// 216: TypeAssertionExpression;
	217: ParenthesizedExpression;
	218: FunctionExpression;
	219: ArrowFunction;
	220: DeleteExpression;
	221: TypeOfExpression;
	222: VoidExpression;
	223: AwaitExpression;
	224: PrefixUnaryExpression;
	225: PostfixUnaryExpression;
	226: BinaryExpression;
	227: ConditionalExpression;
	228: TemplateExpression;
	229: YieldExpression;
	230: SpreadElement;
	231: ClassExpression;
	232: OmittedExpression;
	233: ExpressionWithTypeArguments;
	234: AsExpression;
	235: NonNullExpression;
	236: MetaProperty;
	237: SyntheticExpression;
	238: SatisfiesExpression;
	239: TemplateSpan;
	240: SemicolonClassElement;
	241: Block;
	242: EmptyStatement;
	243: VariableStatement;
	244: ExpressionStatement;
	245: IfStatement;
	246: DoStatement;
	247: WhileStatement;
	248: ForStatement;
	249: ForInStatement;
	250: ForOfStatement;
	251: ContinueStatement;
	252: BreakStatement;
	253: ReturnStatement;
	254: WithStatement;
	255: SwitchStatement;
	256: LabeledStatement;
	257: ThrowStatement;
	258: TryStatement;
	259: DebuggerStatement;
	260: VariableDeclaration;
	261: VariableDeclarationList;
	262: FunctionDeclaration;
	263: ClassDeclaration;
	264: InterfaceDeclaration;
	265: TypeAliasDeclaration;
	266: EnumDeclaration;
	267: ModuleDeclaration;
	268: ModuleBlock;
	269: CaseBlock;
	270: NamespaceExportDeclaration;
	271: ImportEqualsDeclaration;
	272: ImportDeclaration;
	273: ImportClause;
	274: NamespaceImport;
	275: NamedImports;
	276: ImportSpecifier;
	277: ExportAssignment;
	278: ExportDeclaration;
	279: NamedExports;
	280: NamespaceExport;
	281: ExportSpecifier;
	282: MissingDeclaration;
	283: ExternalModuleReference;
	284: JsxElement;
	285: JsxSelfClosingElement;
	286: JsxOpeningElement;
	287: JsxClosingElement;
	288: JsxFragment;
	289: JsxOpeningFragment;
	290: JsxClosingFragment;
	291: JsxAttribute;
	292: JsxAttributes;
	293: JsxSpreadAttribute;
	294: JsxExpression;
	// 295: JsxNamespacedName;
	296: CaseClause;
	297: DefaultClause;
	298: HeritageClause;
	299: CatchClause;
	300: AssertClause;
	301: AssertEntry;
	302: ImportTypeAssertionContainer;
	303: PropertyAssignment;
	304: ShorthandPropertyAssignment;
	305: SpreadAssignment;
	306: EnumMember;
	307: /** @deprecated */ UnparsedPrologue;
	308: /** @deprecated */ UnparsedPrepend;
	// 309: /** @deprecated */ UnparsedText;
	// 310: /** @deprecated */ UnparsedInternalText;
	311: /** @deprecated */ UnparsedSyntheticReference;
	312: SourceFile;
	313: Bundle;
	314: /** @deprecated */ UnparsedSource;
	315: /** @deprecated */ InputFiles;
	316: JSDocTypeExpression;
	317: JSDocNameReference;
	318: JSDocMemberName;
	319: JSDocAllType;
	320: JSDocUnknownType;
	321: JSDocNullableType;
	322: JSDocNonNullableType;
	323: JSDocOptionalType;
	324: JSDocFunctionType;
	325: JSDocVariadicType;
	326: JSDocNamepathType;
	// 327: JSDoc;

	// 327: JSDocComment;
	328: JSDocText;
	329: JSDocTypeLiteral;
	330: JSDocSignature;
	331: JSDocLink;
	332: JSDocLinkCode;
	333: JSDocLinkPlain;
	334: JSDocTag;
	335: JSDocAugmentsTag;
	336: JSDocImplementsTag;
	337: JSDocAuthorTag;
	338: JSDocDeprecatedTag;
	339: JSDocClassTag;
	340: JSDocPublicTag;
	341: JSDocPrivateTag;
	342: JSDocProtectedTag;
	343: JSDocReadonlyTag;
	344: JSDocOverrideTag;
	345: JSDocCallbackTag;
	346: JSDocOverloadTag;
	347: JSDocEnumTag;
	348: JSDocParameterTag;
	349: JSDocReturnTag;
	350: JSDocThisTag;
	351: JSDocTypeTag;
	352: JSDocTemplateTag;
	353: JSDocTypedefTag;
	354: JSDocSeeTag;
	355: JSDocPropertyTag;
	356: JSDocThrowsTag;
	357: JSDocSatisfiesTag;
	358: SyntaxList;
	359: NotEmittedStatement;
	360: PartiallyEmittedExpression;
	361: CommaListExpression;
	// 362: SyntheticReferenceExpression;
	// 363: Count;

	// 64: FirstAssignment;
	// 79: LastAssignment;
	// 65: FirstCompoundAssignment;
	// 79: LastCompoundAssignment;
	// 83: FirstReservedWord;
	// 118: LastReservedWord;
	// 83: FirstKeyword;
	// 165: LastKeyword;
	// 119: FirstFutureReservedWord;
	// 127: LastFutureReservedWord;
	// 182: FirstTypeNode;
	// 205: LastTypeNode;
	// 19: FirstPunctuation;
	// 79: LastPunctuation;
	// 0: FirstToken;
	// 165: LastToken;
	// 2: FirstTriviaToken;
	// 7: LastTriviaToken;
	// 9: FirstLiteralToken;
	// 15: LastLiteralToken;
	// 15: FirstTemplateToken;
	// 18: LastTemplateToken;
	// 30: FirstBinaryOperator;
	// 79: LastBinaryOperator;
	// 243: FirstStatement;
	// 259: LastStatement;
	// 166: FirstNode;
	// 316: FirstJSDocNode;
	// 357: LastJSDocNode;
	// 334: FirstJSDocTagNode;
	// 357: LastJSDocTagNode;

};
