// apps/ide/lib/transport.ts
var FLIPPER_USB_FILTER = {
  usbVendorId: 1155,
  usbProductId: 22336
};
var DEFAULT_SERIAL_OPTIONS = {
  baudRate: 115200
};
async function requestFlipperPort() {
  if (!("serial" in navigator)) {
    throw new Error("Web Serial API unavailable. Use Chrome/Edge or another Chromium-based browser.");
  }
  return navigator.serial.requestPort({ filters: [FLIPPER_USB_FILTER] });
}
async function getGrantedFlipperPort() {
  if (!("serial" in navigator))
    return null;
  const ports = await navigator.serial.getPorts();
  for (const port of ports) {
    const info = port.getInfo();
    if (info.usbVendorId === FLIPPER_USB_FILTER.usbVendorId && info.usbProductId === FLIPPER_USB_FILTER.usbProductId) {
      return port;
    }
  }
  return null;
}

class WebSerialTransport {
  port;
  opened = false;
  constructor(port) {
    this.port = port;
  }
  async open(options = DEFAULT_SERIAL_OPTIONS) {
    if (this.opened)
      return;
    await this.port.open(options);
    this.opened = true;
  }
  get readable() {
    const r = this.port.readable;
    if (!r) {
      throw new Error("Transport not open or readable stream unavailable.");
    }
    return r;
  }
  get writable() {
    const w = this.port.writable;
    if (!w) {
      throw new Error("Transport not open or writable stream unavailable.");
    }
    return w;
  }
  async close() {
    if (!this.opened)
      return;
    try {
      const r = this.port.readable;
      if (r)
        await r.cancel().catch(() => {});
    } catch {}
    try {
      const w = this.port.writable;
      if (w)
        await w.abort().catch(() => {});
    } catch {}
    try {
      await this.port.close();
    } finally {
      this.opened = false;
    }
  }
}
// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/binary-format-contract.js
var UnknownFieldHandler;
(function(UnknownFieldHandler2) {
  UnknownFieldHandler2.symbol = Symbol.for("protobuf-ts/unknown");
  UnknownFieldHandler2.onRead = (typeName, message, fieldNo, wireType, data) => {
    let container = is(message) ? message[UnknownFieldHandler2.symbol] : message[UnknownFieldHandler2.symbol] = [];
    container.push({ no: fieldNo, wireType, data });
  };
  UnknownFieldHandler2.onWrite = (typeName, message, writer) => {
    for (let { no, wireType, data } of UnknownFieldHandler2.list(message))
      writer.tag(no, wireType).raw(data);
  };
  UnknownFieldHandler2.list = (message, fieldNo) => {
    if (is(message)) {
      let all = message[UnknownFieldHandler2.symbol];
      return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
    }
    return [];
  };
  UnknownFieldHandler2.last = (message, fieldNo) => UnknownFieldHandler2.list(message, fieldNo).slice(-1)[0];
  const is = (message) => message && Array.isArray(message[UnknownFieldHandler2.symbol]);
})(UnknownFieldHandler || (UnknownFieldHandler = {}));
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/message-type-contract.js
var MESSAGE_TYPE = Symbol.for("protobuf-ts/message-type");

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/lower-camel-case.js
function lowerCamelCase(snakeCase) {
  let capNext = false;
  const sb = [];
  for (let i = 0;i < snakeCase.length; i++) {
    let next = snakeCase.charAt(i);
    if (next == "_") {
      capNext = true;
    } else if (/\d/.test(next)) {
      sb.push(next);
      capNext = true;
    } else if (capNext) {
      sb.push(next.toUpperCase());
      capNext = false;
    } else if (i == 0) {
      sb.push(next.toLowerCase());
    } else {
      sb.push(next);
    }
  }
  return sb.join("");
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-info.js
var ScalarType;
(function(ScalarType2) {
  ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
  ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
  ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
  ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
  ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
  ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
  ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
  ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
  ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
  ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
  ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
  ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
  ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
  ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
  ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));
var LongType;
(function(LongType2) {
  LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
  LongType2[LongType2["STRING"] = 1] = "STRING";
  LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
})(LongType || (LongType = {}));
var RepeatType;
(function(RepeatType2) {
  RepeatType2[RepeatType2["NO"] = 0] = "NO";
  RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
  RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
})(RepeatType || (RepeatType = {}));
function normalizeFieldInfo(field) {
  var _a, _b, _c, _d;
  field.localName = (_a = field.localName) !== null && _a !== undefined ? _a : lowerCamelCase(field.name);
  field.jsonName = (_b = field.jsonName) !== null && _b !== undefined ? _b : lowerCamelCase(field.name);
  field.repeat = (_c = field.repeat) !== null && _c !== undefined ? _c : RepeatType.NO;
  field.opt = (_d = field.opt) !== null && _d !== undefined ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
  return field;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/oneof.js
function isOneofGroup(any) {
  if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
    return false;
  }
  switch (typeof any.oneofKind) {
    case "string":
      if (any[any.oneofKind] === undefined)
        return false;
      return Object.keys(any).length == 2;
    case "undefined":
      return Object.keys(any).length == 1;
    default:
      return false;
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-type-check.js
class ReflectionTypeCheck {
  constructor(info) {
    var _a;
    this.fields = (_a = info.fields) !== null && _a !== undefined ? _a : [];
  }
  prepare() {
    if (this.data)
      return;
    const req = [], known = [], oneofs = [];
    for (let field of this.fields) {
      if (field.oneof) {
        if (!oneofs.includes(field.oneof)) {
          oneofs.push(field.oneof);
          req.push(field.oneof);
          known.push(field.oneof);
        }
      } else {
        known.push(field.localName);
        switch (field.kind) {
          case "scalar":
          case "enum":
            if (!field.opt || field.repeat)
              req.push(field.localName);
            break;
          case "message":
            if (field.repeat)
              req.push(field.localName);
            break;
          case "map":
            req.push(field.localName);
            break;
        }
      }
    }
    this.data = { req, known, oneofs: Object.values(oneofs) };
  }
  is(message, depth, allowExcessProperties = false) {
    if (depth < 0)
      return true;
    if (message === null || message === undefined || typeof message != "object")
      return false;
    this.prepare();
    let keys = Object.keys(message), data = this.data;
    if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n)))
      return false;
    if (!allowExcessProperties) {
      if (keys.some((k) => !data.known.includes(k)))
        return false;
    }
    if (depth < 1) {
      return true;
    }
    for (const name of data.oneofs) {
      const group = message[name];
      if (!isOneofGroup(group))
        return false;
      if (group.oneofKind === undefined)
        continue;
      const field = this.fields.find((f) => f.localName === group.oneofKind);
      if (!field)
        return false;
      if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
        return false;
    }
    for (const field of this.fields) {
      if (field.oneof !== undefined)
        continue;
      if (!this.field(message[field.localName], field, allowExcessProperties, depth))
        return false;
    }
    return true;
  }
  field(arg, field, allowExcessProperties, depth) {
    let repeated = field.repeat;
    switch (field.kind) {
      case "scalar":
        if (arg === undefined)
          return field.opt;
        if (repeated)
          return this.scalars(arg, field.T, depth, field.L);
        return this.scalar(arg, field.T, field.L);
      case "enum":
        if (arg === undefined)
          return field.opt;
        if (repeated)
          return this.scalars(arg, ScalarType.INT32, depth);
        return this.scalar(arg, ScalarType.INT32);
      case "message":
        if (arg === undefined)
          return true;
        if (repeated)
          return this.messages(arg, field.T(), allowExcessProperties, depth);
        return this.message(arg, field.T(), allowExcessProperties, depth);
      case "map":
        if (typeof arg != "object" || arg === null)
          return false;
        if (depth < 2)
          return true;
        if (!this.mapKeys(arg, field.K, depth))
          return false;
        switch (field.V.kind) {
          case "scalar":
            return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
          case "enum":
            return this.scalars(Object.values(arg), ScalarType.INT32, depth);
          case "message":
            return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
        }
        break;
    }
    return true;
  }
  message(arg, type, allowExcessProperties, depth) {
    if (allowExcessProperties) {
      return type.isAssignable(arg, depth);
    }
    return type.is(arg, depth);
  }
  messages(arg, type, allowExcessProperties, depth) {
    if (!Array.isArray(arg))
      return false;
    if (depth < 2)
      return true;
    if (allowExcessProperties) {
      for (let i = 0;i < arg.length && i < depth; i++)
        if (!type.isAssignable(arg[i], depth - 1))
          return false;
    } else {
      for (let i = 0;i < arg.length && i < depth; i++)
        if (!type.is(arg[i], depth - 1))
          return false;
    }
    return true;
  }
  scalar(arg, type, longType) {
    let argType = typeof arg;
    switch (type) {
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        switch (longType) {
          case LongType.BIGINT:
            return argType == "bigint";
          case LongType.NUMBER:
            return argType == "number" && !isNaN(arg);
          default:
            return argType == "string";
        }
      case ScalarType.BOOL:
        return argType == "boolean";
      case ScalarType.STRING:
        return argType == "string";
      case ScalarType.BYTES:
        return arg instanceof Uint8Array;
      case ScalarType.DOUBLE:
      case ScalarType.FLOAT:
        return argType == "number" && !isNaN(arg);
      default:
        return argType == "number" && Number.isInteger(arg);
    }
  }
  scalars(arg, type, depth, longType) {
    if (!Array.isArray(arg))
      return false;
    if (depth < 2)
      return true;
    if (Array.isArray(arg)) {
      for (let i = 0;i < arg.length && i < depth; i++)
        if (!this.scalar(arg[i], type, longType))
          return false;
    }
    return true;
  }
  mapKeys(map, type, depth) {
    let keys = Object.keys(map);
    switch (type) {
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
      case ScalarType.UINT32:
        return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
      case ScalarType.BOOL:
        return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
      default:
        return this.scalars(keys, type, depth, LongType.STRING);
    }
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/json-typings.js
function typeofJsonValue(value) {
  let t = typeof value;
  if (t == "object") {
    if (Array.isArray(value))
      return "array";
    if (value === null)
      return "null";
  }
  return t;
}
function isJsonObject(value) {
  return value !== null && typeof value == "object" && !Array.isArray(value);
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/base64.js
var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var decTable = [];
for (let i = 0;i < encTable.length; i++)
  decTable[encTable[i].charCodeAt(0)] = i;
decTable[45] = encTable.indexOf("+");
decTable[95] = encTable.indexOf("/");
function base64decode(base64Str) {
  let es = base64Str.length * 3 / 4;
  if (base64Str[base64Str.length - 2] == "=")
    es -= 2;
  else if (base64Str[base64Str.length - 1] == "=")
    es -= 1;
  let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
  for (let i = 0;i < base64Str.length; i++) {
    b = decTable[base64Str.charCodeAt(i)];
    if (b === undefined) {
      switch (base64Str[i]) {
        case "=":
          groupPos = 0;
        case `
`:
        case "\r":
        case "\t":
        case " ":
          continue;
        default:
          throw Error(`invalid base64 string.`);
      }
    }
    switch (groupPos) {
      case 0:
        p = b;
        groupPos = 1;
        break;
      case 1:
        bytes[bytePos++] = p << 2 | (b & 48) >> 4;
        p = b;
        groupPos = 2;
        break;
      case 2:
        bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
        p = b;
        groupPos = 3;
        break;
      case 3:
        bytes[bytePos++] = (p & 3) << 6 | b;
        groupPos = 0;
        break;
    }
  }
  if (groupPos == 1)
    throw Error(`invalid base64 string.`);
  return bytes.subarray(0, bytePos);
}
function base64encode(bytes) {
  let base64 = "", groupPos = 0, b, p = 0;
  for (let i = 0;i < bytes.length; i++) {
    b = bytes[i];
    switch (groupPos) {
      case 0:
        base64 += encTable[b >> 2];
        p = (b & 3) << 4;
        groupPos = 1;
        break;
      case 1:
        base64 += encTable[p | b >> 4];
        p = (b & 15) << 2;
        groupPos = 2;
        break;
      case 2:
        base64 += encTable[p | b >> 6];
        base64 += encTable[b & 63];
        groupPos = 0;
        break;
    }
  }
  if (groupPos) {
    base64 += encTable[p];
    base64 += "=";
    if (groupPos == 1)
      base64 += "=";
  }
  return base64;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/goog-varint.js
function varint64read() {
  let lowBits = 0;
  let highBits = 0;
  for (let shift = 0;shift < 28; shift += 7) {
    let b = this.buf[this.pos++];
    lowBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  let middleByte = this.buf[this.pos++];
  lowBits |= (middleByte & 15) << 28;
  highBits = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.assertBounds();
    return [lowBits, highBits];
  }
  for (let shift = 3;shift <= 31; shift += 7) {
    let b = this.buf[this.pos++];
    highBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  throw new Error("invalid varint");
}
function varint64write(lo, hi, bytes) {
  for (let i = 0;i < 28; i = i + 7) {
    const shift = lo >>> i;
    const hasNext = !(shift >>> 7 == 0 && hi == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
  const hasMoreBits = !(hi >> 3 == 0);
  bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
  if (!hasMoreBits) {
    return;
  }
  for (let i = 3;i < 31; i = i + 7) {
    const shift = hi >>> i;
    const hasNext = !(shift >>> 7 == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  bytes.push(hi >>> 31 & 1);
}
var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
function int64fromString(dec) {
  let minus = dec[0] == "-";
  if (minus)
    dec = dec.slice(1);
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return [minus, lowBits, highBits];
}
function int64toString(bitsLow, bitsHigh) {
  if (bitsHigh >>> 0 <= 2097151) {
    return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
  }
  let low = bitsLow & 16777215;
  let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
  let high = bitsHigh >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  let base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  function decimalFrom1e7(digit1e7, needLeadingZeros) {
    let partial = digit1e7 ? String(digit1e7) : "";
    if (needLeadingZeros) {
      return "0000000".slice(partial.length) + partial;
    }
    return partial;
  }
  return decimalFrom1e7(digitC, 0) + decimalFrom1e7(digitB, digitC) + decimalFrom1e7(digitA, 1);
}
function varint32write(value, bytes) {
  if (value >= 0) {
    while (value > 127) {
      bytes.push(value & 127 | 128);
      value = value >>> 7;
    }
    bytes.push(value);
  } else {
    for (let i = 0;i < 9; i++) {
      bytes.push(value & 127 | 128);
      value = value >> 7;
    }
    bytes.push(1);
  }
}
function varint32read() {
  let b = this.buf[this.pos++];
  let result = b & 127;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 7;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 14;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 21;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 15) << 28;
  for (let readBytes = 5;(b & 128) !== 0 && readBytes < 10; readBytes++)
    b = this.buf[this.pos++];
  if ((b & 128) != 0)
    throw new Error("invalid varint");
  this.assertBounds();
  return result >>> 0;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/pb-long.js
var BI;
function detectBi() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = globalThis.BigInt !== undefined && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
  BI = ok ? {
    MIN: BigInt("-9223372036854775808"),
    MAX: BigInt("9223372036854775807"),
    UMIN: BigInt("0"),
    UMAX: BigInt("18446744073709551615"),
    C: BigInt,
    V: dv
  } : undefined;
}
detectBi();
function assertBi(bi) {
  if (!bi)
    throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
}
var RE_DECIMAL_STR = /^-?[0-9]+$/;
var TWO_PWR_32_DBL2 = 4294967296;
var HALF_2_PWR_32 = 2147483648;

class SharedPbLong {
  constructor(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
  }
  isZero() {
    return this.lo == 0 && this.hi == 0;
  }
  toNumber() {
    let result = this.hi * TWO_PWR_32_DBL2 + (this.lo >>> 0);
    if (!Number.isSafeInteger(result))
      throw new Error("cannot convert to safe number");
    return result;
  }
}

class PbULong extends SharedPbLong {
  static from(value) {
    if (BI)
      switch (typeof value) {
        case "string":
          if (value == "0")
            return this.ZERO;
          if (value == "")
            throw new Error("string is no integer");
          value = BI.C(value);
        case "number":
          if (value === 0)
            return this.ZERO;
          value = BI.C(value);
        case "bigint":
          if (!value)
            return this.ZERO;
          if (value < BI.UMIN)
            throw new Error("signed value for ulong");
          if (value > BI.UMAX)
            throw new Error("ulong too large");
          BI.V.setBigUint64(0, value, true);
          return new PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
      }
    else
      switch (typeof value) {
        case "string":
          if (value == "0")
            return this.ZERO;
          value = value.trim();
          if (!RE_DECIMAL_STR.test(value))
            throw new Error("string is no integer");
          let [minus, lo, hi] = int64fromString(value);
          if (minus)
            throw new Error("signed value for ulong");
          return new PbULong(lo, hi);
        case "number":
          if (value == 0)
            return this.ZERO;
          if (!Number.isSafeInteger(value))
            throw new Error("number is no integer");
          if (value < 0)
            throw new Error("signed value for ulong");
          return new PbULong(value, value / TWO_PWR_32_DBL2);
      }
    throw new Error("unknown value " + typeof value);
  }
  toString() {
    return BI ? this.toBigInt().toString() : int64toString(this.lo, this.hi);
  }
  toBigInt() {
    assertBi(BI);
    BI.V.setInt32(0, this.lo, true);
    BI.V.setInt32(4, this.hi, true);
    return BI.V.getBigUint64(0, true);
  }
}
PbULong.ZERO = new PbULong(0, 0);

class PbLong extends SharedPbLong {
  static from(value) {
    if (BI)
      switch (typeof value) {
        case "string":
          if (value == "0")
            return this.ZERO;
          if (value == "")
            throw new Error("string is no integer");
          value = BI.C(value);
        case "number":
          if (value === 0)
            return this.ZERO;
          value = BI.C(value);
        case "bigint":
          if (!value)
            return this.ZERO;
          if (value < BI.MIN)
            throw new Error("signed long too small");
          if (value > BI.MAX)
            throw new Error("signed long too large");
          BI.V.setBigInt64(0, value, true);
          return new PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
      }
    else
      switch (typeof value) {
        case "string":
          if (value == "0")
            return this.ZERO;
          value = value.trim();
          if (!RE_DECIMAL_STR.test(value))
            throw new Error("string is no integer");
          let [minus, lo, hi] = int64fromString(value);
          if (minus) {
            if (hi > HALF_2_PWR_32 || hi == HALF_2_PWR_32 && lo != 0)
              throw new Error("signed long too small");
          } else if (hi >= HALF_2_PWR_32)
            throw new Error("signed long too large");
          let pbl = new PbLong(lo, hi);
          return minus ? pbl.negate() : pbl;
        case "number":
          if (value == 0)
            return this.ZERO;
          if (!Number.isSafeInteger(value))
            throw new Error("number is no integer");
          return value > 0 ? new PbLong(value, value / TWO_PWR_32_DBL2) : new PbLong(-value, -value / TWO_PWR_32_DBL2).negate();
      }
    throw new Error("unknown value " + typeof value);
  }
  isNegative() {
    return (this.hi & HALF_2_PWR_32) !== 0;
  }
  negate() {
    let hi = ~this.hi, lo = this.lo;
    if (lo)
      lo = ~lo + 1;
    else
      hi += 1;
    return new PbLong(lo, hi);
  }
  toString() {
    if (BI)
      return this.toBigInt().toString();
    if (this.isNegative()) {
      let n = this.negate();
      return "-" + int64toString(n.lo, n.hi);
    }
    return int64toString(this.lo, this.hi);
  }
  toBigInt() {
    assertBi(BI);
    BI.V.setInt32(0, this.lo, true);
    BI.V.setInt32(4, this.hi, true);
    return BI.V.getBigInt64(0, true);
  }
}
PbLong.ZERO = new PbLong(0, 0);

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/assert.js
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}
var FLOAT32_MAX = 340282346638528860000000000000000000000;
var FLOAT32_MIN = -340282346638528860000000000000000000000;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
function assertInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid int 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int 32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid uint 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint 32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg !== "number")
    throw new Error("invalid float 32: " + typeof arg);
  if (!Number.isFinite(arg))
    return;
  if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
    throw new Error("invalid float 32: " + arg);
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-long-convert.js
function reflectionLongConvert(long, type) {
  switch (type) {
    case LongType.BIGINT:
      return long.toBigInt();
    case LongType.NUMBER:
      return long.toNumber();
    default:
      return long.toString();
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-reader.js
class ReflectionJsonReader {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    var _a;
    if (this.fMap === undefined) {
      this.fMap = {};
      const fieldsInput = (_a = this.info.fields) !== null && _a !== undefined ? _a : [];
      for (const field of fieldsInput) {
        this.fMap[field.name] = field;
        this.fMap[field.jsonName] = field;
        this.fMap[field.localName] = field;
      }
    }
  }
  assert(condition, fieldName, jsonValue) {
    if (!condition) {
      let what = typeofJsonValue(jsonValue);
      if (what == "number" || what == "boolean")
        what = jsonValue.toString();
      throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
    }
  }
  read(input, message, options) {
    this.prepare();
    const oneofsHandled = [];
    for (const [jsonKey, jsonValue] of Object.entries(input)) {
      const field = this.fMap[jsonKey];
      if (!field) {
        if (!options.ignoreUnknownFields)
          throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
        continue;
      }
      const localName = field.localName;
      let target;
      if (field.oneof) {
        if (jsonValue === null && (field.kind !== "enum" || field.T()[0] !== "google.protobuf.NullValue")) {
          continue;
        }
        if (oneofsHandled.includes(field.oneof))
          throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
        oneofsHandled.push(field.oneof);
        target = message[field.oneof] = {
          oneofKind: localName
        };
      } else {
        target = message;
      }
      if (field.kind == "map") {
        if (jsonValue === null) {
          continue;
        }
        this.assert(isJsonObject(jsonValue), field.name, jsonValue);
        const fieldObj = target[localName];
        for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
          this.assert(jsonObjValue !== null, field.name + " map value", null);
          let val;
          switch (field.V.kind) {
            case "message":
              val = field.V.T().internalJsonRead(jsonObjValue, options);
              break;
            case "enum":
              val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
              if (val === false)
                continue;
              break;
            case "scalar":
              val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
              break;
          }
          this.assert(val !== undefined, field.name + " map value", jsonObjValue);
          let key = jsonObjKey;
          if (field.K == ScalarType.BOOL)
            key = key == "true" ? true : key == "false" ? false : key;
          key = this.scalar(key, field.K, LongType.STRING, field.name).toString();
          fieldObj[key] = val;
        }
      } else if (field.repeat) {
        if (jsonValue === null)
          continue;
        this.assert(Array.isArray(jsonValue), field.name, jsonValue);
        const fieldArr = target[localName];
        for (const jsonItem of jsonValue) {
          this.assert(jsonItem !== null, field.name, null);
          let val;
          switch (field.kind) {
            case "message":
              val = field.T().internalJsonRead(jsonItem, options);
              break;
            case "enum":
              val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
              if (val === false)
                continue;
              break;
            case "scalar":
              val = this.scalar(jsonItem, field.T, field.L, field.name);
              break;
          }
          this.assert(val !== undefined, field.name, jsonValue);
          fieldArr.push(val);
        }
      } else {
        switch (field.kind) {
          case "message":
            if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
              this.assert(field.oneof === undefined, field.name + " (oneof member)", null);
              continue;
            }
            target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
            break;
          case "enum":
            if (jsonValue === null)
              continue;
            let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
            if (val === false)
              continue;
            target[localName] = val;
            break;
          case "scalar":
            if (jsonValue === null)
              continue;
            target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
            break;
        }
      }
    }
  }
  enum(type, json, fieldName, ignoreUnknownFields) {
    if (type[0] == "google.protobuf.NullValue")
      assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
    if (json === null)
      return 0;
    switch (typeof json) {
      case "number":
        assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
        return json;
      case "string":
        let localEnumName = json;
        if (type[2] && json.substring(0, type[2].length) === type[2])
          localEnumName = json.substring(type[2].length);
        let enumNumber = type[1][localEnumName];
        if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
          return false;
        }
        assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
        return enumNumber;
    }
    assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
  }
  scalar(json, type, longType, fieldName) {
    let e;
    try {
      switch (type) {
        case ScalarType.DOUBLE:
        case ScalarType.FLOAT:
          if (json === null)
            return 0;
          if (json === "NaN")
            return Number.NaN;
          if (json === "Infinity")
            return Number.POSITIVE_INFINITY;
          if (json === "-Infinity")
            return Number.NEGATIVE_INFINITY;
          if (json === "") {
            e = "empty string";
            break;
          }
          if (typeof json == "string" && json.trim().length !== json.length) {
            e = "extra whitespace";
            break;
          }
          if (typeof json != "string" && typeof json != "number") {
            break;
          }
          let float = Number(json);
          if (Number.isNaN(float)) {
            e = "not a number";
            break;
          }
          if (!Number.isFinite(float)) {
            e = "too large or small";
            break;
          }
          if (type == ScalarType.FLOAT)
            assertFloat32(float);
          return float;
        case ScalarType.INT32:
        case ScalarType.FIXED32:
        case ScalarType.SFIXED32:
        case ScalarType.SINT32:
        case ScalarType.UINT32:
          if (json === null)
            return 0;
          let int32;
          if (typeof json == "number")
            int32 = json;
          else if (json === "")
            e = "empty string";
          else if (typeof json == "string") {
            if (json.trim().length !== json.length)
              e = "extra whitespace";
            else
              int32 = Number(json);
          }
          if (int32 === undefined)
            break;
          if (type == ScalarType.UINT32)
            assertUInt32(int32);
          else
            assertInt32(int32);
          return int32;
        case ScalarType.INT64:
        case ScalarType.SFIXED64:
        case ScalarType.SINT64:
          if (json === null)
            return reflectionLongConvert(PbLong.ZERO, longType);
          if (typeof json != "number" && typeof json != "string")
            break;
          return reflectionLongConvert(PbLong.from(json), longType);
        case ScalarType.FIXED64:
        case ScalarType.UINT64:
          if (json === null)
            return reflectionLongConvert(PbULong.ZERO, longType);
          if (typeof json != "number" && typeof json != "string")
            break;
          return reflectionLongConvert(PbULong.from(json), longType);
        case ScalarType.BOOL:
          if (json === null)
            return false;
          if (typeof json !== "boolean")
            break;
          return json;
        case ScalarType.STRING:
          if (json === null)
            return "";
          if (typeof json !== "string") {
            e = "extra whitespace";
            break;
          }
          try {
            encodeURIComponent(json);
          } catch (e2) {
            e2 = "invalid UTF8";
            break;
          }
          return json;
        case ScalarType.BYTES:
          if (json === null || json === "")
            return new Uint8Array(0);
          if (typeof json !== "string")
            break;
          return base64decode(json);
      }
    } catch (error) {
      e = error.message;
    }
    this.assert(false, fieldName + (e ? " - " + e : ""), json);
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-writer.js
class ReflectionJsonWriter {
  constructor(info) {
    var _a;
    this.fields = (_a = info.fields) !== null && _a !== undefined ? _a : [];
  }
  write(message, options) {
    const json = {}, source = message;
    for (const field of this.fields) {
      if (!field.oneof) {
        let jsonValue2 = this.field(field, source[field.localName], options);
        if (jsonValue2 !== undefined)
          json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
        continue;
      }
      const group = source[field.oneof];
      if (group.oneofKind !== field.localName)
        continue;
      const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
      let jsonValue = this.field(field, group[field.localName], opt);
      assert(jsonValue !== undefined);
      json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
    }
    return json;
  }
  field(field, value, options) {
    let jsonValue = undefined;
    if (field.kind == "map") {
      assert(typeof value == "object" && value !== null);
      const jsonObj = {};
      switch (field.V.kind) {
        case "scalar":
          for (const [entryKey, entryValue] of Object.entries(value)) {
            const val = this.scalar(field.V.T, entryValue, field.name, false, true);
            assert(val !== undefined);
            jsonObj[entryKey.toString()] = val;
          }
          break;
        case "message":
          const messageType = field.V.T();
          for (const [entryKey, entryValue] of Object.entries(value)) {
            const val = this.message(messageType, entryValue, field.name, options);
            assert(val !== undefined);
            jsonObj[entryKey.toString()] = val;
          }
          break;
        case "enum":
          const enumInfo = field.V.T();
          for (const [entryKey, entryValue] of Object.entries(value)) {
            assert(entryValue === undefined || typeof entryValue == "number");
            const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
            assert(val !== undefined);
            jsonObj[entryKey.toString()] = val;
          }
          break;
      }
      if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
        jsonValue = jsonObj;
    } else if (field.repeat) {
      assert(Array.isArray(value));
      const jsonArr = [];
      switch (field.kind) {
        case "scalar":
          for (let i = 0;i < value.length; i++) {
            const val = this.scalar(field.T, value[i], field.name, field.opt, true);
            assert(val !== undefined);
            jsonArr.push(val);
          }
          break;
        case "enum":
          const enumInfo = field.T();
          for (let i = 0;i < value.length; i++) {
            assert(value[i] === undefined || typeof value[i] == "number");
            const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
            assert(val !== undefined);
            jsonArr.push(val);
          }
          break;
        case "message":
          const messageType = field.T();
          for (let i = 0;i < value.length; i++) {
            const val = this.message(messageType, value[i], field.name, options);
            assert(val !== undefined);
            jsonArr.push(val);
          }
          break;
      }
      if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
        jsonValue = jsonArr;
    } else {
      switch (field.kind) {
        case "scalar":
          jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
          break;
        case "enum":
          jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
          break;
        case "message":
          jsonValue = this.message(field.T(), value, field.name, options);
          break;
      }
    }
    return jsonValue;
  }
  enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
    if (type[0] == "google.protobuf.NullValue")
      return !emitDefaultValues && !optional ? undefined : null;
    if (value === undefined) {
      assert(optional);
      return;
    }
    if (value === 0 && !emitDefaultValues && !optional)
      return;
    assert(typeof value == "number");
    assert(Number.isInteger(value));
    if (enumAsInteger || !type[1].hasOwnProperty(value))
      return value;
    if (type[2])
      return type[2] + type[1][value];
    return type[1][value];
  }
  message(type, value, fieldName, options) {
    if (value === undefined)
      return options.emitDefaultValues ? null : undefined;
    return type.internalJsonWrite(value, options);
  }
  scalar(type, value, fieldName, optional, emitDefaultValues) {
    if (value === undefined) {
      assert(optional);
      return;
    }
    const ed = emitDefaultValues || optional;
    switch (type) {
      case ScalarType.INT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
        if (value === 0)
          return ed ? 0 : undefined;
        assertInt32(value);
        return value;
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
        if (value === 0)
          return ed ? 0 : undefined;
        assertUInt32(value);
        return value;
      case ScalarType.FLOAT:
        assertFloat32(value);
      case ScalarType.DOUBLE:
        if (value === 0)
          return ed ? 0 : undefined;
        assert(typeof value == "number");
        if (Number.isNaN(value))
          return "NaN";
        if (value === Number.POSITIVE_INFINITY)
          return "Infinity";
        if (value === Number.NEGATIVE_INFINITY)
          return "-Infinity";
        return value;
      case ScalarType.STRING:
        if (value === "")
          return ed ? "" : undefined;
        assert(typeof value == "string");
        return value;
      case ScalarType.BOOL:
        if (value === false)
          return ed ? false : undefined;
        assert(typeof value == "boolean");
        return value;
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
        assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
        let ulong = PbULong.from(value);
        if (ulong.isZero() && !ed)
          return;
        return ulong.toString();
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
        let long = PbLong.from(value);
        if (long.isZero() && !ed)
          return;
        return long.toString();
      case ScalarType.BYTES:
        assert(value instanceof Uint8Array);
        if (!value.byteLength)
          return ed ? "" : undefined;
        return base64encode(value);
    }
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-scalar-default.js
function reflectionScalarDefault(type, longType = LongType.STRING) {
  switch (type) {
    case ScalarType.BOOL:
      return false;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return reflectionLongConvert(PbULong.ZERO, longType);
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return reflectionLongConvert(PbLong.ZERO, longType);
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.BYTES:
      return new Uint8Array(0);
    case ScalarType.STRING:
      return "";
    default:
      return 0;
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-reader.js
class ReflectionBinaryReader {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    var _a;
    if (!this.fieldNoToField) {
      const fieldsInput = (_a = this.info.fields) !== null && _a !== undefined ? _a : [];
      this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
    }
  }
  read(reader, message, options, length) {
    this.prepare();
    const end = length === undefined ? reader.len : reader.pos + length;
    while (reader.pos < end) {
      const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
      if (!field) {
        let u = options.readUnknownField;
        if (u == "throw")
          throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
        let d = reader.skip(wireType);
        if (u !== false)
          (u === true ? UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
        continue;
      }
      let target = message, repeated = field.repeat, localName = field.localName;
      if (field.oneof) {
        target = target[field.oneof];
        if (target.oneofKind !== localName)
          target = message[field.oneof] = {
            oneofKind: localName
          };
      }
      switch (field.kind) {
        case "scalar":
        case "enum":
          let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
          let L = field.kind == "scalar" ? field.L : undefined;
          if (repeated) {
            let arr = target[localName];
            if (wireType == WireType.LengthDelimited && T != ScalarType.STRING && T != ScalarType.BYTES) {
              let e = reader.uint32() + reader.pos;
              while (reader.pos < e)
                arr.push(this.scalar(reader, T, L));
            } else
              arr.push(this.scalar(reader, T, L));
          } else
            target[localName] = this.scalar(reader, T, L);
          break;
        case "message":
          if (repeated) {
            let arr = target[localName];
            let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
            arr.push(msg);
          } else
            target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
          break;
        case "map":
          let [mapKey, mapVal] = this.mapEntry(field, reader, options);
          target[localName][mapKey] = mapVal;
          break;
      }
    }
  }
  mapEntry(field, reader, options) {
    let length = reader.uint32();
    let end = reader.pos + length;
    let key = undefined;
    let val = undefined;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          if (field.K == ScalarType.BOOL)
            key = reader.bool().toString();
          else
            key = this.scalar(reader, field.K, LongType.STRING);
          break;
        case 2:
          switch (field.V.kind) {
            case "scalar":
              val = this.scalar(reader, field.V.T, field.V.L);
              break;
            case "enum":
              val = reader.int32();
              break;
            case "message":
              val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
              break;
          }
          break;
        default:
          throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
      }
    }
    if (key === undefined) {
      let keyRaw = reflectionScalarDefault(field.K);
      key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
    }
    if (val === undefined)
      switch (field.V.kind) {
        case "scalar":
          val = reflectionScalarDefault(field.V.T, field.V.L);
          break;
        case "enum":
          val = 0;
          break;
        case "message":
          val = field.V.T().create();
          break;
      }
    return [key, val];
  }
  scalar(reader, type, longType) {
    switch (type) {
      case ScalarType.INT32:
        return reader.int32();
      case ScalarType.STRING:
        return reader.string();
      case ScalarType.BOOL:
        return reader.bool();
      case ScalarType.DOUBLE:
        return reader.double();
      case ScalarType.FLOAT:
        return reader.float();
      case ScalarType.INT64:
        return reflectionLongConvert(reader.int64(), longType);
      case ScalarType.UINT64:
        return reflectionLongConvert(reader.uint64(), longType);
      case ScalarType.FIXED64:
        return reflectionLongConvert(reader.fixed64(), longType);
      case ScalarType.FIXED32:
        return reader.fixed32();
      case ScalarType.BYTES:
        return reader.bytes();
      case ScalarType.UINT32:
        return reader.uint32();
      case ScalarType.SFIXED32:
        return reader.sfixed32();
      case ScalarType.SFIXED64:
        return reflectionLongConvert(reader.sfixed64(), longType);
      case ScalarType.SINT32:
        return reader.sint32();
      case ScalarType.SINT64:
        return reflectionLongConvert(reader.sint64(), longType);
    }
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-writer.js
class ReflectionBinaryWriter {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    if (!this.fields) {
      const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
      this.fields = fieldsInput.sort((a, b) => a.no - b.no);
    }
  }
  write(message, writer, options) {
    this.prepare();
    for (const field of this.fields) {
      let value, emitDefault, repeated = field.repeat, localName = field.localName;
      if (field.oneof) {
        const group = message[field.oneof];
        if (group.oneofKind !== localName)
          continue;
        value = group[localName];
        emitDefault = true;
      } else {
        value = message[localName];
        emitDefault = false;
      }
      switch (field.kind) {
        case "scalar":
        case "enum":
          let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
          if (repeated) {
            assert(Array.isArray(value));
            if (repeated == RepeatType.PACKED)
              this.packed(writer, T, field.no, value);
            else
              for (const item of value)
                this.scalar(writer, T, field.no, item, true);
          } else if (value === undefined)
            assert(field.opt);
          else
            this.scalar(writer, T, field.no, value, emitDefault || field.opt);
          break;
        case "message":
          if (repeated) {
            assert(Array.isArray(value));
            for (const item of value)
              this.message(writer, options, field.T(), field.no, item);
          } else {
            this.message(writer, options, field.T(), field.no, value);
          }
          break;
        case "map":
          assert(typeof value == "object" && value !== null);
          for (const [key, val] of Object.entries(value))
            this.mapEntry(writer, options, field, key, val);
          break;
      }
    }
    let u = options.writeUnknownFields;
    if (u !== false)
      (u === true ? UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
  }
  mapEntry(writer, options, field, key, value) {
    writer.tag(field.no, WireType.LengthDelimited);
    writer.fork();
    let keyValue = key;
    switch (field.K) {
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
        keyValue = Number.parseInt(key);
        break;
      case ScalarType.BOOL:
        assert(key == "true" || key == "false");
        keyValue = key == "true";
        break;
    }
    this.scalar(writer, field.K, 1, keyValue, true);
    switch (field.V.kind) {
      case "scalar":
        this.scalar(writer, field.V.T, 2, value, true);
        break;
      case "enum":
        this.scalar(writer, ScalarType.INT32, 2, value, true);
        break;
      case "message":
        this.message(writer, options, field.V.T(), 2, value);
        break;
    }
    writer.join();
  }
  message(writer, options, handler, fieldNo, value) {
    if (value === undefined)
      return;
    handler.internalBinaryWrite(value, writer.tag(fieldNo, WireType.LengthDelimited).fork(), options);
    writer.join();
  }
  scalar(writer, type, fieldNo, value, emitDefault) {
    let [wireType, method, isDefault] = this.scalarInfo(type, value);
    if (!isDefault || emitDefault) {
      writer.tag(fieldNo, wireType);
      writer[method](value);
    }
  }
  packed(writer, type, fieldNo, value) {
    if (!value.length)
      return;
    assert(type !== ScalarType.BYTES && type !== ScalarType.STRING);
    writer.tag(fieldNo, WireType.LengthDelimited);
    writer.fork();
    let [, method] = this.scalarInfo(type);
    for (let i = 0;i < value.length; i++)
      writer[method](value[i]);
    writer.join();
  }
  scalarInfo(type, value) {
    let t = WireType.Varint;
    let m;
    let i = value === undefined;
    let d = value === 0;
    switch (type) {
      case ScalarType.INT32:
        m = "int32";
        break;
      case ScalarType.STRING:
        d = i || !value.length;
        t = WireType.LengthDelimited;
        m = "string";
        break;
      case ScalarType.BOOL:
        d = value === false;
        m = "bool";
        break;
      case ScalarType.UINT32:
        m = "uint32";
        break;
      case ScalarType.DOUBLE:
        t = WireType.Bit64;
        m = "double";
        break;
      case ScalarType.FLOAT:
        t = WireType.Bit32;
        m = "float";
        break;
      case ScalarType.INT64:
        d = i || PbLong.from(value).isZero();
        m = "int64";
        break;
      case ScalarType.UINT64:
        d = i || PbULong.from(value).isZero();
        m = "uint64";
        break;
      case ScalarType.FIXED64:
        d = i || PbULong.from(value).isZero();
        t = WireType.Bit64;
        m = "fixed64";
        break;
      case ScalarType.BYTES:
        d = i || !value.byteLength;
        t = WireType.LengthDelimited;
        m = "bytes";
        break;
      case ScalarType.FIXED32:
        t = WireType.Bit32;
        m = "fixed32";
        break;
      case ScalarType.SFIXED32:
        t = WireType.Bit32;
        m = "sfixed32";
        break;
      case ScalarType.SFIXED64:
        d = i || PbLong.from(value).isZero();
        t = WireType.Bit64;
        m = "sfixed64";
        break;
      case ScalarType.SINT32:
        m = "sint32";
        break;
      case ScalarType.SINT64:
        d = i || PbLong.from(value).isZero();
        m = "sint64";
        break;
    }
    return [t, m, i || d];
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-create.js
function reflectionCreate(type) {
  const msg = type.messagePrototype ? Object.create(type.messagePrototype) : Object.defineProperty({}, MESSAGE_TYPE, { value: type });
  for (let field of type.fields) {
    let name = field.localName;
    if (field.opt)
      continue;
    if (field.oneof)
      msg[field.oneof] = { oneofKind: undefined };
    else if (field.repeat)
      msg[name] = [];
    else
      switch (field.kind) {
        case "scalar":
          msg[name] = reflectionScalarDefault(field.T, field.L);
          break;
        case "enum":
          msg[name] = 0;
          break;
        case "map":
          msg[name] = {};
          break;
      }
  }
  return msg;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-merge-partial.js
function reflectionMergePartial(info, target, source) {
  let fieldValue, input = source, output;
  for (let field of info.fields) {
    let name = field.localName;
    if (field.oneof) {
      const group = input[field.oneof];
      if ((group === null || group === undefined ? undefined : group.oneofKind) == undefined) {
        continue;
      }
      fieldValue = group[name];
      output = target[field.oneof];
      output.oneofKind = group.oneofKind;
      if (fieldValue == undefined) {
        delete output[name];
        continue;
      }
    } else {
      fieldValue = input[name];
      output = target;
      if (fieldValue == undefined) {
        continue;
      }
    }
    if (field.repeat)
      output[name].length = fieldValue.length;
    switch (field.kind) {
      case "scalar":
      case "enum":
        if (field.repeat)
          for (let i = 0;i < fieldValue.length; i++)
            output[name][i] = fieldValue[i];
        else
          output[name] = fieldValue;
        break;
      case "message":
        let T = field.T();
        if (field.repeat)
          for (let i = 0;i < fieldValue.length; i++)
            output[name][i] = T.create(fieldValue[i]);
        else if (output[name] === undefined)
          output[name] = T.create(fieldValue);
        else
          T.mergePartial(output[name], fieldValue);
        break;
      case "map":
        switch (field.V.kind) {
          case "scalar":
          case "enum":
            Object.assign(output[name], fieldValue);
            break;
          case "message":
            let T2 = field.V.T();
            for (let k of Object.keys(fieldValue))
              output[name][k] = T2.create(fieldValue[k]);
            break;
        }
        break;
    }
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/json-format-contract.js
var defaultsWrite = {
  emitDefaultValues: false,
  enumAsInteger: false,
  useProtoFieldName: false,
  prettySpaces: 0
};
var defaultsRead = {
  ignoreUnknownFields: false
};
function jsonReadOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
}
function jsonWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/reflection-equals.js
function reflectionEquals(info, a, b) {
  if (a === b)
    return true;
  if (!a || !b)
    return false;
  for (let field of info.fields) {
    let localName = field.localName;
    let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
    let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
    switch (field.kind) {
      case "enum":
      case "scalar":
        let t = field.kind == "enum" ? ScalarType.INT32 : field.T;
        if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b)))
          return false;
        break;
      case "map":
        if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
          return false;
        break;
      case "message":
        let T = field.T();
        if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b)))
          return false;
        break;
    }
  }
  return true;
}
var objectValues = Object.values;
function primitiveEq(type, a, b) {
  if (a === b)
    return true;
  if (type !== ScalarType.BYTES)
    return false;
  let ba = a;
  let bb = b;
  if (ba.length !== bb.length)
    return false;
  for (let i = 0;i < ba.length; i++)
    if (ba[i] != bb[i])
      return false;
  return true;
}
function repeatedPrimitiveEq(type, a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0;i < a.length; i++)
    if (!primitiveEq(type, a[i], b[i]))
      return false;
  return true;
}
function repeatedMsgEq(type, a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0;i < a.length; i++)
    if (!type.equals(a[i], b[i]))
      return false;
  return true;
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/binary-writer.js
var defaultsWrite2 = {
  writeUnknownFields: true,
  writerFactory: () => new BinaryWriter
};
function binaryWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsWrite2), options) : defaultsWrite2;
}

class BinaryWriter {
  constructor(textEncoder) {
    this.stack = [];
    this.textEncoder = textEncoder !== null && textEncoder !== undefined ? textEncoder : new TextEncoder;
    this.chunks = [];
    this.buf = [];
  }
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
    let len = 0;
    for (let i = 0;i < this.chunks.length; i++)
      len += this.chunks[i].length;
    let bytes = new Uint8Array(len);
    let offset = 0;
    for (let i = 0;i < this.chunks.length; i++) {
      bytes.set(this.chunks[i], offset);
      offset += this.chunks[i].length;
    }
    this.chunks = [];
    return bytes;
  }
  fork() {
    this.stack.push({ chunks: this.chunks, buf: this.buf });
    this.chunks = [];
    this.buf = [];
    return this;
  }
  join() {
    let chunk = this.finish();
    let prev = this.stack.pop();
    if (!prev)
      throw new Error("invalid state, fork stack empty");
    this.chunks = prev.chunks;
    this.buf = prev.buf;
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  raw(chunk) {
    if (this.buf.length) {
      this.chunks.push(new Uint8Array(this.buf));
      this.buf = [];
    }
    this.chunks.push(chunk);
    return this;
  }
  uint32(value) {
    assertUInt32(value);
    while (value > 127) {
      this.buf.push(value & 127 | 128);
      value = value >>> 7;
    }
    this.buf.push(value);
    return this;
  }
  int32(value) {
    assertInt32(value);
    varint32write(value, this.buf);
    return this;
  }
  bool(value) {
    this.buf.push(value ? 1 : 0);
    return this;
  }
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  string(value) {
    let chunk = this.textEncoder.encode(value);
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  float(value) {
    assertFloat32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setFloat32(0, value, true);
    return this.raw(chunk);
  }
  double(value) {
    let chunk = new Uint8Array(8);
    new DataView(chunk.buffer).setFloat64(0, value, true);
    return this.raw(chunk);
  }
  fixed32(value) {
    assertUInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setUint32(0, value, true);
    return this.raw(chunk);
  }
  sfixed32(value) {
    assertInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setInt32(0, value, true);
    return this.raw(chunk);
  }
  sint32(value) {
    assertInt32(value);
    value = (value << 1 ^ value >> 31) >>> 0;
    varint32write(value, this.buf);
    return this;
  }
  sfixed64(value) {
    let chunk = new Uint8Array(8);
    let view = new DataView(chunk.buffer);
    let long = PbLong.from(value);
    view.setInt32(0, long.lo, true);
    view.setInt32(4, long.hi, true);
    return this.raw(chunk);
  }
  fixed64(value) {
    let chunk = new Uint8Array(8);
    let view = new DataView(chunk.buffer);
    let long = PbULong.from(value);
    view.setInt32(0, long.lo, true);
    view.setInt32(4, long.hi, true);
    return this.raw(chunk);
  }
  int64(value) {
    let long = PbLong.from(value);
    varint64write(long.lo, long.hi, this.buf);
    return this;
  }
  sint64(value) {
    let long = PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
    varint64write(lo, hi, this.buf);
    return this;
  }
  uint64(value) {
    let long = PbULong.from(value);
    varint64write(long.lo, long.hi, this.buf);
    return this;
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/binary-reader.js
var defaultsRead2 = {
  readUnknownField: true,
  readerFactory: (bytes) => new BinaryReader(bytes)
};
function binaryReadOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsRead2), options) : defaultsRead2;
}

class BinaryReader {
  constructor(buf, textDecoder) {
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.textDecoder = textDecoder !== null && textDecoder !== undefined ? textDecoder : new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true
    });
  }
  tag() {
    let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
    if (fieldNo <= 0 || wireType < 0 || wireType > 5)
      throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    return [fieldNo, wireType];
  }
  skip(wireType) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {}
        break;
      case WireType.Bit64:
        this.pos += 4;
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        let t;
        while ((t = this.tag()[1]) !== WireType.EndGroup) {
          this.skip(t);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  int32() {
    return this.uint32() | 0;
  }
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  int64() {
    return new PbLong(...this.varint64());
  }
  uint64() {
    return new PbULong(...this.varint64());
  }
  sint64() {
    let [lo, hi] = this.varint64();
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return new PbLong(lo, hi);
  }
  bool() {
    let [lo, hi] = this.varint64();
    return lo !== 0 || hi !== 0;
  }
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  fixed64() {
    return new PbULong(this.sfixed32(), this.sfixed32());
  }
  sfixed64() {
    return new PbLong(this.sfixed32(), this.sfixed32());
  }
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  bytes() {
    let len = this.uint32();
    let start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  string() {
    return this.textDecoder.decode(this.bytes());
  }
}

// node_modules/.bun/@protobuf-ts+runtime@2.11.1/node_modules/@protobuf-ts/runtime/build/es2015/message-type.js
var baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
var messageTypeDescriptor = baseDescriptors[MESSAGE_TYPE] = {};

class MessageType {
  constructor(name, fields, options) {
    this.defaultCheckDepth = 16;
    this.typeName = name;
    this.fields = fields.map(normalizeFieldInfo);
    this.options = options !== null && options !== undefined ? options : {};
    messageTypeDescriptor.value = this;
    this.messagePrototype = Object.create(null, baseDescriptors);
    this.refTypeCheck = new ReflectionTypeCheck(this);
    this.refJsonReader = new ReflectionJsonReader(this);
    this.refJsonWriter = new ReflectionJsonWriter(this);
    this.refBinReader = new ReflectionBinaryReader(this);
    this.refBinWriter = new ReflectionBinaryWriter(this);
  }
  create(value) {
    let message = reflectionCreate(this);
    if (value !== undefined) {
      reflectionMergePartial(this, message, value);
    }
    return message;
  }
  clone(message) {
    let copy = this.create();
    reflectionMergePartial(this, copy, message);
    return copy;
  }
  equals(a, b) {
    return reflectionEquals(this, a, b);
  }
  is(arg, depth = this.defaultCheckDepth) {
    return this.refTypeCheck.is(arg, depth, false);
  }
  isAssignable(arg, depth = this.defaultCheckDepth) {
    return this.refTypeCheck.is(arg, depth, true);
  }
  mergePartial(target, source) {
    reflectionMergePartial(this, target, source);
  }
  fromBinary(data, options) {
    let opt = binaryReadOptions(options);
    return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
  }
  fromJson(json, options) {
    return this.internalJsonRead(json, jsonReadOptions(options));
  }
  fromJsonString(json, options) {
    let value = JSON.parse(json);
    return this.fromJson(value, options);
  }
  toJson(message, options) {
    return this.internalJsonWrite(message, jsonWriteOptions(options));
  }
  toJsonString(message, options) {
    var _a;
    let value = this.toJson(message, options);
    return JSON.stringify(value, null, (_a = options === null || options === undefined ? undefined : options.prettySpaces) !== null && _a !== undefined ? _a : 0);
  }
  toBinary(message, options) {
    let opt = binaryWriteOptions(options);
    return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
  }
  internalJsonRead(json, options, target) {
    if (json !== null && typeof json == "object" && !Array.isArray(json)) {
      let message = target !== null && target !== undefined ? target : this.create();
      this.refJsonReader.read(json, message, options);
      return message;
    }
    throw new Error(`Unable to parse message ${this.typeName} from JSON ${typeofJsonValue(json)}.`);
  }
  internalJsonWrite(message, options) {
    return this.refJsonWriter.write(message, options);
  }
  internalBinaryWrite(message, writer, options) {
    this.refBinWriter.write(message, writer, options);
    return writer;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target !== null && target !== undefined ? target : this.create();
    this.refBinReader.read(reader, message, options, length);
    return message;
  }
}
// apps/ide/lib/proto/generated/desktop.js
class IsLockedRequest$Type extends MessageType {
  constructor() {
    super("PB_Desktop.IsLockedRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var IsLockedRequest = new IsLockedRequest$Type;

class UnlockRequest$Type extends MessageType {
  constructor() {
    super("PB_Desktop.UnlockRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var UnlockRequest = new UnlockRequest$Type;

class StatusSubscribeRequest$Type extends MessageType {
  constructor() {
    super("PB_Desktop.StatusSubscribeRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StatusSubscribeRequest = new StatusSubscribeRequest$Type;

class StatusUnsubscribeRequest$Type extends MessageType {
  constructor() {
    super("PB_Desktop.StatusUnsubscribeRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StatusUnsubscribeRequest = new StatusUnsubscribeRequest$Type;

class Status$Type extends MessageType {
  constructor() {
    super("PB_Desktop.Status", [
      { no: 1, name: "locked", kind: "scalar", T: 8 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.locked = false;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.locked = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.locked !== false)
      writer.tag(1, WireType.Varint).bool(message.locked);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Status = new Status$Type;

// apps/ide/lib/proto/generated/property.js
class GetRequest$Type extends MessageType {
  constructor() {
    super("PB_Property.GetRequest", [
      { no: 1, name: "key", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.key = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.key = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.key !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.key);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetRequest = new GetRequest$Type;

class GetResponse$Type extends MessageType {
  constructor() {
    super("PB_Property.GetResponse", [
      { no: 1, name: "key", kind: "scalar", T: 9 },
      { no: 2, name: "value", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.key = "";
    message.value = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.key !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.key);
    if (message.value !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.value);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetResponse = new GetResponse$Type;

// apps/ide/lib/proto/generated/application.js
var AppState;
(function(AppState2) {
  AppState2[AppState2["APP_CLOSED"] = 0] = "APP_CLOSED";
  AppState2[AppState2["APP_STARTED"] = 1] = "APP_STARTED";
})(AppState || (AppState = {}));

class StartRequest$Type extends MessageType {
  constructor() {
    super("PB_App.StartRequest", [
      { no: 1, name: "name", kind: "scalar", T: 9 },
      { no: 2, name: "args", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.name = "";
    message.args = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.args = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.name !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.name);
    if (message.args !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.args);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StartRequest = new StartRequest$Type;

class LockStatusRequest$Type extends MessageType {
  constructor() {
    super("PB_App.LockStatusRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var LockStatusRequest = new LockStatusRequest$Type;

class LockStatusResponse$Type extends MessageType {
  constructor() {
    super("PB_App.LockStatusResponse", [
      { no: 1, name: "locked", kind: "scalar", T: 8 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.locked = false;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.locked = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.locked !== false)
      writer.tag(1, WireType.Varint).bool(message.locked);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var LockStatusResponse = new LockStatusResponse$Type;

class AppExitRequest$Type extends MessageType {
  constructor() {
    super("PB_App.AppExitRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppExitRequest = new AppExitRequest$Type;

class AppLoadFileRequest$Type extends MessageType {
  constructor() {
    super("PB_App.AppLoadFileRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppLoadFileRequest = new AppLoadFileRequest$Type;

class AppButtonPressRequest$Type extends MessageType {
  constructor() {
    super("PB_App.AppButtonPressRequest", [
      { no: 1, name: "args", kind: "scalar", T: 9 },
      { no: 2, name: "index", kind: "scalar", T: 5 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.args = "";
    message.index = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.args = reader.string();
          break;
        case 2:
          message.index = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.args !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.args);
    if (message.index !== 0)
      writer.tag(2, WireType.Varint).int32(message.index);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppButtonPressRequest = new AppButtonPressRequest$Type;

class AppButtonReleaseRequest$Type extends MessageType {
  constructor() {
    super("PB_App.AppButtonReleaseRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppButtonReleaseRequest = new AppButtonReleaseRequest$Type;

class AppButtonPressReleaseRequest$Type extends MessageType {
  constructor() {
    super("PB_App.AppButtonPressReleaseRequest", [
      { no: 1, name: "args", kind: "scalar", T: 9 },
      { no: 2, name: "index", kind: "scalar", T: 5 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.args = "";
    message.index = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.args = reader.string();
          break;
        case 2:
          message.index = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.args !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.args);
    if (message.index !== 0)
      writer.tag(2, WireType.Varint).int32(message.index);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppButtonPressReleaseRequest = new AppButtonPressReleaseRequest$Type;

class AppStateResponse$Type extends MessageType {
  constructor() {
    super("PB_App.AppStateResponse", [
      { no: 1, name: "state", kind: "enum", T: () => ["PB_App.AppState", AppState] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.state = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.state = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.state !== 0)
      writer.tag(1, WireType.Varint).int32(message.state);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var AppStateResponse = new AppStateResponse$Type;

class GetErrorRequest$Type extends MessageType {
  constructor() {
    super("PB_App.GetErrorRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetErrorRequest = new GetErrorRequest$Type;

class GetErrorResponse$Type extends MessageType {
  constructor() {
    super("PB_App.GetErrorResponse", [
      { no: 1, name: "code", kind: "scalar", T: 13 },
      { no: 2, name: "text", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.code = 0;
    message.text = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.code = reader.uint32();
          break;
        case 2:
          message.text = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.code !== 0)
      writer.tag(1, WireType.Varint).uint32(message.code);
    if (message.text !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.text);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetErrorResponse = new GetErrorResponse$Type;

class DataExchangeRequest$Type extends MessageType {
  constructor() {
    super("PB_App.DataExchangeRequest", [
      { no: 1, name: "data", kind: "scalar", T: 12 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.data = new Uint8Array(0);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.data = reader.bytes();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.data.length)
      writer.tag(1, WireType.LengthDelimited).bytes(message.data);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var DataExchangeRequest = new DataExchangeRequest$Type;

// apps/ide/lib/proto/generated/gpio.js
var GpioPin;
(function(GpioPin2) {
  GpioPin2[GpioPin2["PC0"] = 0] = "PC0";
  GpioPin2[GpioPin2["PC1"] = 1] = "PC1";
  GpioPin2[GpioPin2["PC3"] = 2] = "PC3";
  GpioPin2[GpioPin2["PB2"] = 3] = "PB2";
  GpioPin2[GpioPin2["PB3"] = 4] = "PB3";
  GpioPin2[GpioPin2["PA4"] = 5] = "PA4";
  GpioPin2[GpioPin2["PA6"] = 6] = "PA6";
  GpioPin2[GpioPin2["PA7"] = 7] = "PA7";
})(GpioPin || (GpioPin = {}));
var GpioPinMode;
(function(GpioPinMode2) {
  GpioPinMode2[GpioPinMode2["OUTPUT"] = 0] = "OUTPUT";
  GpioPinMode2[GpioPinMode2["INPUT"] = 1] = "INPUT";
})(GpioPinMode || (GpioPinMode = {}));
var GpioInputPull;
(function(GpioInputPull2) {
  GpioInputPull2[GpioInputPull2["NO"] = 0] = "NO";
  GpioInputPull2[GpioInputPull2["UP"] = 1] = "UP";
  GpioInputPull2[GpioInputPull2["DOWN"] = 2] = "DOWN";
})(GpioInputPull || (GpioInputPull = {}));
var GpioOtgMode;
(function(GpioOtgMode2) {
  GpioOtgMode2[GpioOtgMode2["OFF"] = 0] = "OFF";
  GpioOtgMode2[GpioOtgMode2["ON"] = 1] = "ON";
})(GpioOtgMode || (GpioOtgMode = {}));

class SetPinMode$Type extends MessageType {
  constructor() {
    super("PB_Gpio.SetPinMode", [
      { no: 1, name: "pin", kind: "enum", T: () => ["PB_Gpio.GpioPin", GpioPin] },
      { no: 2, name: "mode", kind: "enum", T: () => ["PB_Gpio.GpioPinMode", GpioPinMode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.pin = 0;
    message.mode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.pin = reader.int32();
          break;
        case 2:
          message.mode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.pin !== 0)
      writer.tag(1, WireType.Varint).int32(message.pin);
    if (message.mode !== 0)
      writer.tag(2, WireType.Varint).int32(message.mode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var SetPinMode = new SetPinMode$Type;

class SetInputPull$Type extends MessageType {
  constructor() {
    super("PB_Gpio.SetInputPull", [
      { no: 1, name: "pin", kind: "enum", T: () => ["PB_Gpio.GpioPin", GpioPin] },
      { no: 2, name: "pull_mode", kind: "enum", T: () => ["PB_Gpio.GpioInputPull", GpioInputPull] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.pin = 0;
    message.pullMode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.pin = reader.int32();
          break;
        case 2:
          message.pullMode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.pin !== 0)
      writer.tag(1, WireType.Varint).int32(message.pin);
    if (message.pullMode !== 0)
      writer.tag(2, WireType.Varint).int32(message.pullMode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var SetInputPull = new SetInputPull$Type;

class GetPinMode$Type extends MessageType {
  constructor() {
    super("PB_Gpio.GetPinMode", [
      { no: 1, name: "pin", kind: "enum", T: () => ["PB_Gpio.GpioPin", GpioPin] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.pin = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.pin = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.pin !== 0)
      writer.tag(1, WireType.Varint).int32(message.pin);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetPinMode = new GetPinMode$Type;

class GetPinModeResponse$Type extends MessageType {
  constructor() {
    super("PB_Gpio.GetPinModeResponse", [
      { no: 1, name: "mode", kind: "enum", T: () => ["PB_Gpio.GpioPinMode", GpioPinMode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.mode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.mode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.mode !== 0)
      writer.tag(1, WireType.Varint).int32(message.mode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetPinModeResponse = new GetPinModeResponse$Type;

class ReadPin$Type extends MessageType {
  constructor() {
    super("PB_Gpio.ReadPin", [
      { no: 1, name: "pin", kind: "enum", T: () => ["PB_Gpio.GpioPin", GpioPin] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.pin = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.pin = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.pin !== 0)
      writer.tag(1, WireType.Varint).int32(message.pin);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ReadPin = new ReadPin$Type;

class ReadPinResponse$Type extends MessageType {
  constructor() {
    super("PB_Gpio.ReadPinResponse", [
      { no: 2, name: "value", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.value = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 2:
          message.value = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.value !== 0)
      writer.tag(2, WireType.Varint).uint32(message.value);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ReadPinResponse = new ReadPinResponse$Type;

class WritePin$Type extends MessageType {
  constructor() {
    super("PB_Gpio.WritePin", [
      { no: 1, name: "pin", kind: "enum", T: () => ["PB_Gpio.GpioPin", GpioPin] },
      { no: 2, name: "value", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.pin = 0;
    message.value = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.pin = reader.int32();
          break;
        case 2:
          message.value = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.pin !== 0)
      writer.tag(1, WireType.Varint).int32(message.pin);
    if (message.value !== 0)
      writer.tag(2, WireType.Varint).uint32(message.value);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var WritePin = new WritePin$Type;

class GetOtgMode$Type extends MessageType {
  constructor() {
    super("PB_Gpio.GetOtgMode", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetOtgMode = new GetOtgMode$Type;

class GetOtgModeResponse$Type extends MessageType {
  constructor() {
    super("PB_Gpio.GetOtgModeResponse", [
      { no: 1, name: "mode", kind: "enum", T: () => ["PB_Gpio.GpioOtgMode", GpioOtgMode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.mode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.mode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.mode !== 0)
      writer.tag(1, WireType.Varint).int32(message.mode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetOtgModeResponse = new GetOtgModeResponse$Type;

class SetOtgMode$Type extends MessageType {
  constructor() {
    super("PB_Gpio.SetOtgMode", [
      { no: 1, name: "mode", kind: "enum", T: () => ["PB_Gpio.GpioOtgMode", GpioOtgMode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.mode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.mode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.mode !== 0)
      writer.tag(1, WireType.Varint).int32(message.mode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var SetOtgMode = new SetOtgMode$Type;

// apps/ide/lib/proto/generated/gui.js
var InputKey;
(function(InputKey2) {
  InputKey2[InputKey2["UP"] = 0] = "UP";
  InputKey2[InputKey2["DOWN"] = 1] = "DOWN";
  InputKey2[InputKey2["RIGHT"] = 2] = "RIGHT";
  InputKey2[InputKey2["LEFT"] = 3] = "LEFT";
  InputKey2[InputKey2["OK"] = 4] = "OK";
  InputKey2[InputKey2["BACK"] = 5] = "BACK";
})(InputKey || (InputKey = {}));
var InputType;
(function(InputType2) {
  InputType2[InputType2["PRESS"] = 0] = "PRESS";
  InputType2[InputType2["RELEASE"] = 1] = "RELEASE";
  InputType2[InputType2["SHORT"] = 2] = "SHORT";
  InputType2[InputType2["LONG"] = 3] = "LONG";
  InputType2[InputType2["REPEAT"] = 4] = "REPEAT";
})(InputType || (InputType = {}));
var ScreenOrientation;
(function(ScreenOrientation2) {
  ScreenOrientation2[ScreenOrientation2["HORIZONTAL"] = 0] = "HORIZONTAL";
  ScreenOrientation2[ScreenOrientation2["HORIZONTAL_FLIP"] = 1] = "HORIZONTAL_FLIP";
  ScreenOrientation2[ScreenOrientation2["VERTICAL"] = 2] = "VERTICAL";
  ScreenOrientation2[ScreenOrientation2["VERTICAL_FLIP"] = 3] = "VERTICAL_FLIP";
})(ScreenOrientation || (ScreenOrientation = {}));

class ScreenFrame$Type extends MessageType {
  constructor() {
    super("PB_Gui.ScreenFrame", [
      { no: 1, name: "data", kind: "scalar", T: 12 },
      { no: 2, name: "orientation", kind: "enum", T: () => ["PB_Gui.ScreenOrientation", ScreenOrientation] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.data = new Uint8Array(0);
    message.orientation = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.data = reader.bytes();
          break;
        case 2:
          message.orientation = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.data.length)
      writer.tag(1, WireType.LengthDelimited).bytes(message.data);
    if (message.orientation !== 0)
      writer.tag(2, WireType.Varint).int32(message.orientation);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ScreenFrame = new ScreenFrame$Type;

class StartScreenStreamRequest$Type extends MessageType {
  constructor() {
    super("PB_Gui.StartScreenStreamRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StartScreenStreamRequest = new StartScreenStreamRequest$Type;

class StopScreenStreamRequest$Type extends MessageType {
  constructor() {
    super("PB_Gui.StopScreenStreamRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StopScreenStreamRequest = new StopScreenStreamRequest$Type;

class SendInputEventRequest$Type extends MessageType {
  constructor() {
    super("PB_Gui.SendInputEventRequest", [
      { no: 1, name: "key", kind: "enum", T: () => ["PB_Gui.InputKey", InputKey] },
      { no: 2, name: "type", kind: "enum", T: () => ["PB_Gui.InputType", InputType] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.key = 0;
    message.type = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.key = reader.int32();
          break;
        case 2:
          message.type = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.key !== 0)
      writer.tag(1, WireType.Varint).int32(message.key);
    if (message.type !== 0)
      writer.tag(2, WireType.Varint).int32(message.type);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var SendInputEventRequest = new SendInputEventRequest$Type;

class StartVirtualDisplayRequest$Type extends MessageType {
  constructor() {
    super("PB_Gui.StartVirtualDisplayRequest", [
      { no: 1, name: "first_frame", kind: "message", T: () => ScreenFrame },
      { no: 2, name: "send_input", kind: "scalar", T: 8 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.sendInput = false;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.firstFrame = ScreenFrame.internalBinaryRead(reader, reader.uint32(), options, message.firstFrame);
          break;
        case 2:
          message.sendInput = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.firstFrame)
      ScreenFrame.internalBinaryWrite(message.firstFrame, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    if (message.sendInput !== false)
      writer.tag(2, WireType.Varint).bool(message.sendInput);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StartVirtualDisplayRequest = new StartVirtualDisplayRequest$Type;

class StopVirtualDisplayRequest$Type extends MessageType {
  constructor() {
    super("PB_Gui.StopVirtualDisplayRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StopVirtualDisplayRequest = new StopVirtualDisplayRequest$Type;

// apps/ide/lib/proto/generated/storage.js
var File_FileType;
(function(File_FileType2) {
  File_FileType2[File_FileType2["FILE"] = 0] = "FILE";
  File_FileType2[File_FileType2["DIR"] = 1] = "DIR";
})(File_FileType || (File_FileType = {}));

class File$Type extends MessageType {
  constructor() {
    super("PB_Storage.File", [
      { no: 1, name: "type", kind: "enum", T: () => ["PB_Storage.File.FileType", File_FileType] },
      { no: 2, name: "name", kind: "scalar", T: 9 },
      { no: 3, name: "size", kind: "scalar", T: 13 },
      { no: 4, name: "data", kind: "scalar", T: 12 },
      { no: 5, name: "md5sum", kind: "scalar", jsonName: "md5sum", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.type = 0;
    message.name = "";
    message.size = 0;
    message.data = new Uint8Array(0);
    message.md5Sum = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.type = reader.int32();
          break;
        case 2:
          message.name = reader.string();
          break;
        case 3:
          message.size = reader.uint32();
          break;
        case 4:
          message.data = reader.bytes();
          break;
        case 5:
          message.md5Sum = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.type !== 0)
      writer.tag(1, WireType.Varint).int32(message.type);
    if (message.name !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.name);
    if (message.size !== 0)
      writer.tag(3, WireType.Varint).uint32(message.size);
    if (message.data.length)
      writer.tag(4, WireType.LengthDelimited).bytes(message.data);
    if (message.md5Sum !== "")
      writer.tag(5, WireType.LengthDelimited).string(message.md5Sum);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var File = new File$Type;

class InfoRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.InfoRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var InfoRequest = new InfoRequest$Type;

class InfoResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.InfoResponse", [
      { no: 1, name: "total_space", kind: "scalar", T: 4 },
      { no: 2, name: "free_space", kind: "scalar", T: 4 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.totalSpace = "0";
    message.freeSpace = "0";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.totalSpace = reader.uint64().toString();
          break;
        case 2:
          message.freeSpace = reader.uint64().toString();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.totalSpace !== "0")
      writer.tag(1, WireType.Varint).uint64(message.totalSpace);
    if (message.freeSpace !== "0")
      writer.tag(2, WireType.Varint).uint64(message.freeSpace);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var InfoResponse = new InfoResponse$Type;

class TimestampRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.TimestampRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var TimestampRequest = new TimestampRequest$Type;

class TimestampResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.TimestampResponse", [
      { no: 1, name: "timestamp", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.timestamp = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.timestamp = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.timestamp !== 0)
      writer.tag(1, WireType.Varint).uint32(message.timestamp);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var TimestampResponse = new TimestampResponse$Type;

class StatRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.StatRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StatRequest = new StatRequest$Type;

class StatResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.StatResponse", [
      { no: 1, name: "file", kind: "message", T: () => File }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.file = File.internalBinaryRead(reader, reader.uint32(), options, message.file);
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.file)
      File.internalBinaryWrite(message.file, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StatResponse = new StatResponse$Type;

class ListRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.ListRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 },
      { no: 2, name: "include_md5", kind: "scalar", T: 8 },
      { no: 3, name: "filter_max_size", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    message.includeMd5 = false;
    message.filterMaxSize = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.includeMd5 = reader.bool();
          break;
        case 3:
          message.filterMaxSize = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    if (message.includeMd5 !== false)
      writer.tag(2, WireType.Varint).bool(message.includeMd5);
    if (message.filterMaxSize !== 0)
      writer.tag(3, WireType.Varint).uint32(message.filterMaxSize);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ListRequest = new ListRequest$Type;

class ListResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.ListResponse", [
      { no: 1, name: "file", kind: "message", repeat: 2, T: () => File }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.file = [];
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.file.push(File.internalBinaryRead(reader, reader.uint32(), options));
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    for (let i = 0;i < message.file.length; i++)
      File.internalBinaryWrite(message.file[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ListResponse = new ListResponse$Type;

class ReadRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.ReadRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ReadRequest = new ReadRequest$Type;

class ReadResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.ReadResponse", [
      { no: 1, name: "file", kind: "message", T: () => File }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.file = File.internalBinaryRead(reader, reader.uint32(), options, message.file);
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.file)
      File.internalBinaryWrite(message.file, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ReadResponse = new ReadResponse$Type;

class WriteRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.WriteRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 },
      { no: 2, name: "file", kind: "message", T: () => File }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.file = File.internalBinaryRead(reader, reader.uint32(), options, message.file);
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    if (message.file)
      File.internalBinaryWrite(message.file, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var WriteRequest = new WriteRequest$Type;

class DeleteRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.DeleteRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 },
      { no: 2, name: "recursive", kind: "scalar", T: 8 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    message.recursive = false;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        case 2:
          message.recursive = reader.bool();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    if (message.recursive !== false)
      writer.tag(2, WireType.Varint).bool(message.recursive);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var DeleteRequest = new DeleteRequest$Type;

class MkdirRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.MkdirRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var MkdirRequest = new MkdirRequest$Type;

class Md5sumRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.Md5sumRequest", [
      { no: 1, name: "path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.path = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.path = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.path !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.path);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Md5sumRequest = new Md5sumRequest$Type;

class Md5sumResponse$Type extends MessageType {
  constructor() {
    super("PB_Storage.Md5sumResponse", [
      { no: 1, name: "md5sum", kind: "scalar", jsonName: "md5sum", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.md5Sum = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.md5Sum = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.md5Sum !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.md5Sum);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Md5sumResponse = new Md5sumResponse$Type;

class RenameRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.RenameRequest", [
      { no: 1, name: "old_path", kind: "scalar", T: 9 },
      { no: 2, name: "new_path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.oldPath = "";
    message.newPath = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.oldPath = reader.string();
          break;
        case 2:
          message.newPath = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.oldPath !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.oldPath);
    if (message.newPath !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.newPath);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var RenameRequest = new RenameRequest$Type;

class BackupCreateRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.BackupCreateRequest", [
      { no: 1, name: "archive_path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.archivePath = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.archivePath = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.archivePath !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.archivePath);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var BackupCreateRequest = new BackupCreateRequest$Type;

class BackupRestoreRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.BackupRestoreRequest", [
      { no: 1, name: "archive_path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.archivePath = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.archivePath = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.archivePath !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.archivePath);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var BackupRestoreRequest = new BackupRestoreRequest$Type;

class TarExtractRequest$Type extends MessageType {
  constructor() {
    super("PB_Storage.TarExtractRequest", [
      { no: 1, name: "tar_path", kind: "scalar", T: 9 },
      { no: 2, name: "out_path", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.tarPath = "";
    message.outPath = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.tarPath = reader.string();
          break;
        case 2:
          message.outPath = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.tarPath !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.tarPath);
    if (message.outPath !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.outPath);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var TarExtractRequest = new TarExtractRequest$Type;

// apps/ide/lib/proto/generated/system.js
var RebootRequest_RebootMode;
(function(RebootRequest_RebootMode2) {
  RebootRequest_RebootMode2[RebootRequest_RebootMode2["OS"] = 0] = "OS";
  RebootRequest_RebootMode2[RebootRequest_RebootMode2["DFU"] = 1] = "DFU";
  RebootRequest_RebootMode2[RebootRequest_RebootMode2["UPDATE"] = 2] = "UPDATE";
})(RebootRequest_RebootMode || (RebootRequest_RebootMode = {}));
var UpdateResponse_UpdateResultCode;
(function(UpdateResponse_UpdateResultCode2) {
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["OK"] = 0] = "OK";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["ManifestPathInvalid"] = 1] = "ManifestPathInvalid";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["ManifestFolderNotFound"] = 2] = "ManifestFolderNotFound";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["ManifestInvalid"] = 3] = "ManifestInvalid";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["StageMissing"] = 4] = "StageMissing";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["StageIntegrityError"] = 5] = "StageIntegrityError";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["ManifestPointerError"] = 6] = "ManifestPointerError";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["TargetMismatch"] = 7] = "TargetMismatch";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["OutdatedManifestVersion"] = 8] = "OutdatedManifestVersion";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["IntFull"] = 9] = "IntFull";
  UpdateResponse_UpdateResultCode2[UpdateResponse_UpdateResultCode2["UnspecifiedError"] = 10] = "UnspecifiedError";
})(UpdateResponse_UpdateResultCode || (UpdateResponse_UpdateResultCode = {}));

class PingRequest$Type extends MessageType {
  constructor() {
    super("PB_System.PingRequest", [
      { no: 1, name: "data", kind: "scalar", T: 12 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.data = new Uint8Array(0);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.data = reader.bytes();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.data.length)
      writer.tag(1, WireType.LengthDelimited).bytes(message.data);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var PingRequest = new PingRequest$Type;

class PingResponse$Type extends MessageType {
  constructor() {
    super("PB_System.PingResponse", [
      { no: 1, name: "data", kind: "scalar", T: 12 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.data = new Uint8Array(0);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.data = reader.bytes();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.data.length)
      writer.tag(1, WireType.LengthDelimited).bytes(message.data);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var PingResponse = new PingResponse$Type;

class RebootRequest$Type extends MessageType {
  constructor() {
    super("PB_System.RebootRequest", [
      { no: 1, name: "mode", kind: "enum", T: () => ["PB_System.RebootRequest.RebootMode", RebootRequest_RebootMode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.mode = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.mode = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.mode !== 0)
      writer.tag(1, WireType.Varint).int32(message.mode);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var RebootRequest = new RebootRequest$Type;

class DeviceInfoRequest$Type extends MessageType {
  constructor() {
    super("PB_System.DeviceInfoRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var DeviceInfoRequest = new DeviceInfoRequest$Type;

class DeviceInfoResponse$Type extends MessageType {
  constructor() {
    super("PB_System.DeviceInfoResponse", [
      { no: 1, name: "key", kind: "scalar", T: 9 },
      { no: 2, name: "value", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.key = "";
    message.value = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.key !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.key);
    if (message.value !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.value);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var DeviceInfoResponse = new DeviceInfoResponse$Type;

class FactoryResetRequest$Type extends MessageType {
  constructor() {
    super("PB_System.FactoryResetRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var FactoryResetRequest = new FactoryResetRequest$Type;

class GetDateTimeRequest$Type extends MessageType {
  constructor() {
    super("PB_System.GetDateTimeRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetDateTimeRequest = new GetDateTimeRequest$Type;

class GetDateTimeResponse$Type extends MessageType {
  constructor() {
    super("PB_System.GetDateTimeResponse", [
      { no: 1, name: "datetime", kind: "message", T: () => DateTime }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.datetime = DateTime.internalBinaryRead(reader, reader.uint32(), options, message.datetime);
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.datetime)
      DateTime.internalBinaryWrite(message.datetime, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var GetDateTimeResponse = new GetDateTimeResponse$Type;

class SetDateTimeRequest$Type extends MessageType {
  constructor() {
    super("PB_System.SetDateTimeRequest", [
      { no: 1, name: "datetime", kind: "message", T: () => DateTime }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.datetime = DateTime.internalBinaryRead(reader, reader.uint32(), options, message.datetime);
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.datetime)
      DateTime.internalBinaryWrite(message.datetime, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var SetDateTimeRequest = new SetDateTimeRequest$Type;

class DateTime$Type extends MessageType {
  constructor() {
    super("PB_System.DateTime", [
      { no: 1, name: "hour", kind: "scalar", T: 13 },
      { no: 2, name: "minute", kind: "scalar", T: 13 },
      { no: 3, name: "second", kind: "scalar", T: 13 },
      { no: 4, name: "day", kind: "scalar", T: 13 },
      { no: 5, name: "month", kind: "scalar", T: 13 },
      { no: 6, name: "year", kind: "scalar", T: 13 },
      { no: 7, name: "weekday", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.hour = 0;
    message.minute = 0;
    message.second = 0;
    message.day = 0;
    message.month = 0;
    message.year = 0;
    message.weekday = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.hour = reader.uint32();
          break;
        case 2:
          message.minute = reader.uint32();
          break;
        case 3:
          message.second = reader.uint32();
          break;
        case 4:
          message.day = reader.uint32();
          break;
        case 5:
          message.month = reader.uint32();
          break;
        case 6:
          message.year = reader.uint32();
          break;
        case 7:
          message.weekday = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.hour !== 0)
      writer.tag(1, WireType.Varint).uint32(message.hour);
    if (message.minute !== 0)
      writer.tag(2, WireType.Varint).uint32(message.minute);
    if (message.second !== 0)
      writer.tag(3, WireType.Varint).uint32(message.second);
    if (message.day !== 0)
      writer.tag(4, WireType.Varint).uint32(message.day);
    if (message.month !== 0)
      writer.tag(5, WireType.Varint).uint32(message.month);
    if (message.year !== 0)
      writer.tag(6, WireType.Varint).uint32(message.year);
    if (message.weekday !== 0)
      writer.tag(7, WireType.Varint).uint32(message.weekday);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var DateTime = new DateTime$Type;

class PlayAudiovisualAlertRequest$Type extends MessageType {
  constructor() {
    super("PB_System.PlayAudiovisualAlertRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var PlayAudiovisualAlertRequest = new PlayAudiovisualAlertRequest$Type;

class ProtobufVersionRequest$Type extends MessageType {
  constructor() {
    super("PB_System.ProtobufVersionRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ProtobufVersionRequest = new ProtobufVersionRequest$Type;

class ProtobufVersionResponse$Type extends MessageType {
  constructor() {
    super("PB_System.ProtobufVersionResponse", [
      { no: 1, name: "major", kind: "scalar", T: 13 },
      { no: 2, name: "minor", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.major = 0;
    message.minor = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.major = reader.uint32();
          break;
        case 2:
          message.minor = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.major !== 0)
      writer.tag(1, WireType.Varint).uint32(message.major);
    if (message.minor !== 0)
      writer.tag(2, WireType.Varint).uint32(message.minor);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var ProtobufVersionResponse = new ProtobufVersionResponse$Type;

class UpdateRequest$Type extends MessageType {
  constructor() {
    super("PB_System.UpdateRequest", [
      { no: 1, name: "update_manifest", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.updateManifest = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.updateManifest = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.updateManifest !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.updateManifest);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var UpdateRequest = new UpdateRequest$Type;

class UpdateResponse$Type extends MessageType {
  constructor() {
    super("PB_System.UpdateResponse", [
      { no: 1, name: "code", kind: "enum", T: () => ["PB_System.UpdateResponse.UpdateResultCode", UpdateResponse_UpdateResultCode] }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.code = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.code = reader.int32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.code !== 0)
      writer.tag(1, WireType.Varint).int32(message.code);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var UpdateResponse = new UpdateResponse$Type;

class PowerInfoRequest$Type extends MessageType {
  constructor() {
    super("PB_System.PowerInfoRequest", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var PowerInfoRequest = new PowerInfoRequest$Type;

class PowerInfoResponse$Type extends MessageType {
  constructor() {
    super("PB_System.PowerInfoResponse", [
      { no: 1, name: "key", kind: "scalar", T: 9 },
      { no: 2, name: "value", kind: "scalar", T: 9 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.key = "";
    message.value = "";
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.key !== "")
      writer.tag(1, WireType.LengthDelimited).string(message.key);
    if (message.value !== "")
      writer.tag(2, WireType.LengthDelimited).string(message.value);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var PowerInfoResponse = new PowerInfoResponse$Type;

// apps/ide/lib/proto/generated/flipper.js
var CommandStatus;
(function(CommandStatus2) {
  CommandStatus2[CommandStatus2["OK"] = 0] = "OK";
  CommandStatus2[CommandStatus2["ERROR"] = 1] = "ERROR";
  CommandStatus2[CommandStatus2["ERROR_DECODE"] = 2] = "ERROR_DECODE";
  CommandStatus2[CommandStatus2["ERROR_NOT_IMPLEMENTED"] = 3] = "ERROR_NOT_IMPLEMENTED";
  CommandStatus2[CommandStatus2["ERROR_BUSY"] = 4] = "ERROR_BUSY";
  CommandStatus2[CommandStatus2["ERROR_CONTINUOUS_COMMAND_INTERRUPTED"] = 14] = "ERROR_CONTINUOUS_COMMAND_INTERRUPTED";
  CommandStatus2[CommandStatus2["ERROR_INVALID_PARAMETERS"] = 15] = "ERROR_INVALID_PARAMETERS";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_NOT_READY"] = 5] = "ERROR_STORAGE_NOT_READY";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_EXIST"] = 6] = "ERROR_STORAGE_EXIST";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_NOT_EXIST"] = 7] = "ERROR_STORAGE_NOT_EXIST";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_INVALID_PARAMETER"] = 8] = "ERROR_STORAGE_INVALID_PARAMETER";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_DENIED"] = 9] = "ERROR_STORAGE_DENIED";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_INVALID_NAME"] = 10] = "ERROR_STORAGE_INVALID_NAME";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_INTERNAL"] = 11] = "ERROR_STORAGE_INTERNAL";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_NOT_IMPLEMENTED"] = 12] = "ERROR_STORAGE_NOT_IMPLEMENTED";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_ALREADY_OPEN"] = 13] = "ERROR_STORAGE_ALREADY_OPEN";
  CommandStatus2[CommandStatus2["ERROR_STORAGE_DIR_NOT_EMPTY"] = 18] = "ERROR_STORAGE_DIR_NOT_EMPTY";
  CommandStatus2[CommandStatus2["ERROR_APP_CANT_START"] = 16] = "ERROR_APP_CANT_START";
  CommandStatus2[CommandStatus2["ERROR_APP_SYSTEM_LOCKED"] = 17] = "ERROR_APP_SYSTEM_LOCKED";
  CommandStatus2[CommandStatus2["ERROR_APP_NOT_RUNNING"] = 21] = "ERROR_APP_NOT_RUNNING";
  CommandStatus2[CommandStatus2["ERROR_APP_CMD_ERROR"] = 22] = "ERROR_APP_CMD_ERROR";
  CommandStatus2[CommandStatus2["ERROR_VIRTUAL_DISPLAY_ALREADY_STARTED"] = 19] = "ERROR_VIRTUAL_DISPLAY_ALREADY_STARTED";
  CommandStatus2[CommandStatus2["ERROR_VIRTUAL_DISPLAY_NOT_STARTED"] = 20] = "ERROR_VIRTUAL_DISPLAY_NOT_STARTED";
  CommandStatus2[CommandStatus2["ERROR_GPIO_MODE_INCORRECT"] = 58] = "ERROR_GPIO_MODE_INCORRECT";
  CommandStatus2[CommandStatus2["ERROR_GPIO_UNKNOWN_PIN_MODE"] = 59] = "ERROR_GPIO_UNKNOWN_PIN_MODE";
})(CommandStatus || (CommandStatus = {}));

class Empty$Type extends MessageType {
  constructor() {
    super("PB.Empty", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Empty = new Empty$Type;

class StopSession$Type extends MessageType {
  constructor() {
    super("PB.StopSession", []);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var StopSession = new StopSession$Type;

class Main$Type extends MessageType {
  constructor() {
    super("PB.Main", [
      { no: 1, name: "command_id", kind: "scalar", T: 13 },
      { no: 2, name: "command_status", kind: "enum", T: () => ["PB.CommandStatus", CommandStatus] },
      { no: 3, name: "has_next", kind: "scalar", T: 8 },
      { no: 4, name: "empty", kind: "message", oneof: "content", T: () => Empty },
      { no: 19, name: "stop_session", kind: "message", oneof: "content", T: () => StopSession },
      { no: 5, name: "system_ping_request", kind: "message", oneof: "content", T: () => PingRequest },
      { no: 6, name: "system_ping_response", kind: "message", oneof: "content", T: () => PingResponse },
      { no: 31, name: "system_reboot_request", kind: "message", oneof: "content", T: () => RebootRequest },
      { no: 32, name: "system_device_info_request", kind: "message", oneof: "content", T: () => DeviceInfoRequest },
      { no: 33, name: "system_device_info_response", kind: "message", oneof: "content", T: () => DeviceInfoResponse },
      { no: 34, name: "system_factory_reset_request", kind: "message", oneof: "content", T: () => FactoryResetRequest },
      { no: 35, name: "system_get_datetime_request", kind: "message", oneof: "content", T: () => GetDateTimeRequest },
      { no: 36, name: "system_get_datetime_response", kind: "message", oneof: "content", T: () => GetDateTimeResponse },
      { no: 37, name: "system_set_datetime_request", kind: "message", oneof: "content", T: () => SetDateTimeRequest },
      { no: 38, name: "system_play_audiovisual_alert_request", kind: "message", oneof: "content", T: () => PlayAudiovisualAlertRequest },
      { no: 39, name: "system_protobuf_version_request", kind: "message", oneof: "content", T: () => ProtobufVersionRequest },
      { no: 40, name: "system_protobuf_version_response", kind: "message", oneof: "content", T: () => ProtobufVersionResponse },
      { no: 41, name: "system_update_request", kind: "message", oneof: "content", T: () => UpdateRequest },
      { no: 46, name: "system_update_response", kind: "message", oneof: "content", T: () => UpdateResponse },
      { no: 44, name: "system_power_info_request", kind: "message", oneof: "content", T: () => PowerInfoRequest },
      { no: 45, name: "system_power_info_response", kind: "message", oneof: "content", T: () => PowerInfoResponse },
      { no: 28, name: "storage_info_request", kind: "message", oneof: "content", T: () => InfoRequest },
      { no: 29, name: "storage_info_response", kind: "message", oneof: "content", T: () => InfoResponse },
      { no: 59, name: "storage_timestamp_request", kind: "message", oneof: "content", T: () => TimestampRequest },
      { no: 60, name: "storage_timestamp_response", kind: "message", oneof: "content", T: () => TimestampResponse },
      { no: 24, name: "storage_stat_request", kind: "message", oneof: "content", T: () => StatRequest },
      { no: 25, name: "storage_stat_response", kind: "message", oneof: "content", T: () => StatResponse },
      { no: 7, name: "storage_list_request", kind: "message", oneof: "content", T: () => ListRequest },
      { no: 8, name: "storage_list_response", kind: "message", oneof: "content", T: () => ListResponse },
      { no: 9, name: "storage_read_request", kind: "message", oneof: "content", T: () => ReadRequest },
      { no: 10, name: "storage_read_response", kind: "message", oneof: "content", T: () => ReadResponse },
      { no: 11, name: "storage_write_request", kind: "message", oneof: "content", T: () => WriteRequest },
      { no: 12, name: "storage_delete_request", kind: "message", oneof: "content", T: () => DeleteRequest },
      { no: 13, name: "storage_mkdir_request", kind: "message", oneof: "content", T: () => MkdirRequest },
      { no: 14, name: "storage_md5sum_request", kind: "message", jsonName: "storageMd5sumRequest", oneof: "content", T: () => Md5sumRequest },
      { no: 15, name: "storage_md5sum_response", kind: "message", jsonName: "storageMd5sumResponse", oneof: "content", T: () => Md5sumResponse },
      { no: 30, name: "storage_rename_request", kind: "message", oneof: "content", T: () => RenameRequest },
      { no: 42, name: "storage_backup_create_request", kind: "message", oneof: "content", T: () => BackupCreateRequest },
      { no: 43, name: "storage_backup_restore_request", kind: "message", oneof: "content", T: () => BackupRestoreRequest },
      { no: 71, name: "storage_tar_extract_request", kind: "message", oneof: "content", T: () => TarExtractRequest },
      { no: 16, name: "app_start_request", kind: "message", oneof: "content", T: () => StartRequest },
      { no: 17, name: "app_lock_status_request", kind: "message", oneof: "content", T: () => LockStatusRequest },
      { no: 18, name: "app_lock_status_response", kind: "message", oneof: "content", T: () => LockStatusResponse },
      { no: 47, name: "app_exit_request", kind: "message", oneof: "content", T: () => AppExitRequest },
      { no: 48, name: "app_load_file_request", kind: "message", oneof: "content", T: () => AppLoadFileRequest },
      { no: 49, name: "app_button_press_request", kind: "message", oneof: "content", T: () => AppButtonPressRequest },
      { no: 50, name: "app_button_release_request", kind: "message", oneof: "content", T: () => AppButtonReleaseRequest },
      { no: 75, name: "app_button_press_release_request", kind: "message", oneof: "content", T: () => AppButtonPressReleaseRequest },
      { no: 63, name: "app_get_error_request", kind: "message", oneof: "content", T: () => GetErrorRequest },
      { no: 64, name: "app_get_error_response", kind: "message", oneof: "content", T: () => GetErrorResponse },
      { no: 65, name: "app_data_exchange_request", kind: "message", oneof: "content", T: () => DataExchangeRequest },
      { no: 20, name: "gui_start_screen_stream_request", kind: "message", oneof: "content", T: () => StartScreenStreamRequest },
      { no: 21, name: "gui_stop_screen_stream_request", kind: "message", oneof: "content", T: () => StopScreenStreamRequest },
      { no: 22, name: "gui_screen_frame", kind: "message", oneof: "content", T: () => ScreenFrame },
      { no: 23, name: "gui_send_input_event_request", kind: "message", oneof: "content", T: () => SendInputEventRequest },
      { no: 26, name: "gui_start_virtual_display_request", kind: "message", oneof: "content", T: () => StartVirtualDisplayRequest },
      { no: 27, name: "gui_stop_virtual_display_request", kind: "message", oneof: "content", T: () => StopVirtualDisplayRequest },
      { no: 51, name: "gpio_set_pin_mode", kind: "message", oneof: "content", T: () => SetPinMode },
      { no: 52, name: "gpio_set_input_pull", kind: "message", oneof: "content", T: () => SetInputPull },
      { no: 53, name: "gpio_get_pin_mode", kind: "message", oneof: "content", T: () => GetPinMode },
      { no: 54, name: "gpio_get_pin_mode_response", kind: "message", oneof: "content", T: () => GetPinModeResponse },
      { no: 55, name: "gpio_read_pin", kind: "message", oneof: "content", T: () => ReadPin },
      { no: 56, name: "gpio_read_pin_response", kind: "message", oneof: "content", T: () => ReadPinResponse },
      { no: 57, name: "gpio_write_pin", kind: "message", oneof: "content", T: () => WritePin },
      { no: 72, name: "gpio_get_otg_mode", kind: "message", oneof: "content", T: () => GetOtgMode },
      { no: 73, name: "gpio_get_otg_mode_response", kind: "message", oneof: "content", T: () => GetOtgModeResponse },
      { no: 74, name: "gpio_set_otg_mode", kind: "message", oneof: "content", T: () => SetOtgMode },
      { no: 58, name: "app_state_response", kind: "message", oneof: "content", T: () => AppStateResponse },
      { no: 61, name: "property_get_request", kind: "message", oneof: "content", T: () => GetRequest },
      { no: 62, name: "property_get_response", kind: "message", oneof: "content", T: () => GetResponse },
      { no: 66, name: "desktop_is_locked_request", kind: "message", oneof: "content", T: () => IsLockedRequest },
      { no: 67, name: "desktop_unlock_request", kind: "message", oneof: "content", T: () => UnlockRequest },
      { no: 68, name: "desktop_status_subscribe_request", kind: "message", oneof: "content", T: () => StatusSubscribeRequest },
      { no: 69, name: "desktop_status_unsubscribe_request", kind: "message", oneof: "content", T: () => StatusUnsubscribeRequest },
      { no: 70, name: "desktop_status", kind: "message", oneof: "content", T: () => Status }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.commandId = 0;
    message.commandStatus = 0;
    message.hasNext = false;
    message.content = { oneofKind: undefined };
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.commandId = reader.uint32();
          break;
        case 2:
          message.commandStatus = reader.int32();
          break;
        case 3:
          message.hasNext = reader.bool();
          break;
        case 4:
          message.content = {
            oneofKind: "empty",
            empty: Empty.internalBinaryRead(reader, reader.uint32(), options, message.content.empty)
          };
          break;
        case 19:
          message.content = {
            oneofKind: "stopSession",
            stopSession: StopSession.internalBinaryRead(reader, reader.uint32(), options, message.content.stopSession)
          };
          break;
        case 5:
          message.content = {
            oneofKind: "systemPingRequest",
            systemPingRequest: PingRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemPingRequest)
          };
          break;
        case 6:
          message.content = {
            oneofKind: "systemPingResponse",
            systemPingResponse: PingResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemPingResponse)
          };
          break;
        case 31:
          message.content = {
            oneofKind: "systemRebootRequest",
            systemRebootRequest: RebootRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemRebootRequest)
          };
          break;
        case 32:
          message.content = {
            oneofKind: "systemDeviceInfoRequest",
            systemDeviceInfoRequest: DeviceInfoRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemDeviceInfoRequest)
          };
          break;
        case 33:
          message.content = {
            oneofKind: "systemDeviceInfoResponse",
            systemDeviceInfoResponse: DeviceInfoResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemDeviceInfoResponse)
          };
          break;
        case 34:
          message.content = {
            oneofKind: "systemFactoryResetRequest",
            systemFactoryResetRequest: FactoryResetRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemFactoryResetRequest)
          };
          break;
        case 35:
          message.content = {
            oneofKind: "systemGetDatetimeRequest",
            systemGetDatetimeRequest: GetDateTimeRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemGetDatetimeRequest)
          };
          break;
        case 36:
          message.content = {
            oneofKind: "systemGetDatetimeResponse",
            systemGetDatetimeResponse: GetDateTimeResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemGetDatetimeResponse)
          };
          break;
        case 37:
          message.content = {
            oneofKind: "systemSetDatetimeRequest",
            systemSetDatetimeRequest: SetDateTimeRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemSetDatetimeRequest)
          };
          break;
        case 38:
          message.content = {
            oneofKind: "systemPlayAudiovisualAlertRequest",
            systemPlayAudiovisualAlertRequest: PlayAudiovisualAlertRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemPlayAudiovisualAlertRequest)
          };
          break;
        case 39:
          message.content = {
            oneofKind: "systemProtobufVersionRequest",
            systemProtobufVersionRequest: ProtobufVersionRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemProtobufVersionRequest)
          };
          break;
        case 40:
          message.content = {
            oneofKind: "systemProtobufVersionResponse",
            systemProtobufVersionResponse: ProtobufVersionResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemProtobufVersionResponse)
          };
          break;
        case 41:
          message.content = {
            oneofKind: "systemUpdateRequest",
            systemUpdateRequest: UpdateRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemUpdateRequest)
          };
          break;
        case 46:
          message.content = {
            oneofKind: "systemUpdateResponse",
            systemUpdateResponse: UpdateResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemUpdateResponse)
          };
          break;
        case 44:
          message.content = {
            oneofKind: "systemPowerInfoRequest",
            systemPowerInfoRequest: PowerInfoRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.systemPowerInfoRequest)
          };
          break;
        case 45:
          message.content = {
            oneofKind: "systemPowerInfoResponse",
            systemPowerInfoResponse: PowerInfoResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.systemPowerInfoResponse)
          };
          break;
        case 28:
          message.content = {
            oneofKind: "storageInfoRequest",
            storageInfoRequest: InfoRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageInfoRequest)
          };
          break;
        case 29:
          message.content = {
            oneofKind: "storageInfoResponse",
            storageInfoResponse: InfoResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageInfoResponse)
          };
          break;
        case 59:
          message.content = {
            oneofKind: "storageTimestampRequest",
            storageTimestampRequest: TimestampRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageTimestampRequest)
          };
          break;
        case 60:
          message.content = {
            oneofKind: "storageTimestampResponse",
            storageTimestampResponse: TimestampResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageTimestampResponse)
          };
          break;
        case 24:
          message.content = {
            oneofKind: "storageStatRequest",
            storageStatRequest: StatRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageStatRequest)
          };
          break;
        case 25:
          message.content = {
            oneofKind: "storageStatResponse",
            storageStatResponse: StatResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageStatResponse)
          };
          break;
        case 7:
          message.content = {
            oneofKind: "storageListRequest",
            storageListRequest: ListRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageListRequest)
          };
          break;
        case 8:
          message.content = {
            oneofKind: "storageListResponse",
            storageListResponse: ListResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageListResponse)
          };
          break;
        case 9:
          message.content = {
            oneofKind: "storageReadRequest",
            storageReadRequest: ReadRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageReadRequest)
          };
          break;
        case 10:
          message.content = {
            oneofKind: "storageReadResponse",
            storageReadResponse: ReadResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageReadResponse)
          };
          break;
        case 11:
          message.content = {
            oneofKind: "storageWriteRequest",
            storageWriteRequest: WriteRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageWriteRequest)
          };
          break;
        case 12:
          message.content = {
            oneofKind: "storageDeleteRequest",
            storageDeleteRequest: DeleteRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageDeleteRequest)
          };
          break;
        case 13:
          message.content = {
            oneofKind: "storageMkdirRequest",
            storageMkdirRequest: MkdirRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageMkdirRequest)
          };
          break;
        case 14:
          message.content = {
            oneofKind: "storageMd5SumRequest",
            storageMd5SumRequest: Md5sumRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageMd5SumRequest)
          };
          break;
        case 15:
          message.content = {
            oneofKind: "storageMd5SumResponse",
            storageMd5SumResponse: Md5sumResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.storageMd5SumResponse)
          };
          break;
        case 30:
          message.content = {
            oneofKind: "storageRenameRequest",
            storageRenameRequest: RenameRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageRenameRequest)
          };
          break;
        case 42:
          message.content = {
            oneofKind: "storageBackupCreateRequest",
            storageBackupCreateRequest: BackupCreateRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageBackupCreateRequest)
          };
          break;
        case 43:
          message.content = {
            oneofKind: "storageBackupRestoreRequest",
            storageBackupRestoreRequest: BackupRestoreRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageBackupRestoreRequest)
          };
          break;
        case 71:
          message.content = {
            oneofKind: "storageTarExtractRequest",
            storageTarExtractRequest: TarExtractRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.storageTarExtractRequest)
          };
          break;
        case 16:
          message.content = {
            oneofKind: "appStartRequest",
            appStartRequest: StartRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appStartRequest)
          };
          break;
        case 17:
          message.content = {
            oneofKind: "appLockStatusRequest",
            appLockStatusRequest: LockStatusRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appLockStatusRequest)
          };
          break;
        case 18:
          message.content = {
            oneofKind: "appLockStatusResponse",
            appLockStatusResponse: LockStatusResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.appLockStatusResponse)
          };
          break;
        case 47:
          message.content = {
            oneofKind: "appExitRequest",
            appExitRequest: AppExitRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appExitRequest)
          };
          break;
        case 48:
          message.content = {
            oneofKind: "appLoadFileRequest",
            appLoadFileRequest: AppLoadFileRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appLoadFileRequest)
          };
          break;
        case 49:
          message.content = {
            oneofKind: "appButtonPressRequest",
            appButtonPressRequest: AppButtonPressRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appButtonPressRequest)
          };
          break;
        case 50:
          message.content = {
            oneofKind: "appButtonReleaseRequest",
            appButtonReleaseRequest: AppButtonReleaseRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appButtonReleaseRequest)
          };
          break;
        case 75:
          message.content = {
            oneofKind: "appButtonPressReleaseRequest",
            appButtonPressReleaseRequest: AppButtonPressReleaseRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appButtonPressReleaseRequest)
          };
          break;
        case 63:
          message.content = {
            oneofKind: "appGetErrorRequest",
            appGetErrorRequest: GetErrorRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appGetErrorRequest)
          };
          break;
        case 64:
          message.content = {
            oneofKind: "appGetErrorResponse",
            appGetErrorResponse: GetErrorResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.appGetErrorResponse)
          };
          break;
        case 65:
          message.content = {
            oneofKind: "appDataExchangeRequest",
            appDataExchangeRequest: DataExchangeRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.appDataExchangeRequest)
          };
          break;
        case 20:
          message.content = {
            oneofKind: "guiStartScreenStreamRequest",
            guiStartScreenStreamRequest: StartScreenStreamRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.guiStartScreenStreamRequest)
          };
          break;
        case 21:
          message.content = {
            oneofKind: "guiStopScreenStreamRequest",
            guiStopScreenStreamRequest: StopScreenStreamRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.guiStopScreenStreamRequest)
          };
          break;
        case 22:
          message.content = {
            oneofKind: "guiScreenFrame",
            guiScreenFrame: ScreenFrame.internalBinaryRead(reader, reader.uint32(), options, message.content.guiScreenFrame)
          };
          break;
        case 23:
          message.content = {
            oneofKind: "guiSendInputEventRequest",
            guiSendInputEventRequest: SendInputEventRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.guiSendInputEventRequest)
          };
          break;
        case 26:
          message.content = {
            oneofKind: "guiStartVirtualDisplayRequest",
            guiStartVirtualDisplayRequest: StartVirtualDisplayRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.guiStartVirtualDisplayRequest)
          };
          break;
        case 27:
          message.content = {
            oneofKind: "guiStopVirtualDisplayRequest",
            guiStopVirtualDisplayRequest: StopVirtualDisplayRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.guiStopVirtualDisplayRequest)
          };
          break;
        case 51:
          message.content = {
            oneofKind: "gpioSetPinMode",
            gpioSetPinMode: SetPinMode.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioSetPinMode)
          };
          break;
        case 52:
          message.content = {
            oneofKind: "gpioSetInputPull",
            gpioSetInputPull: SetInputPull.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioSetInputPull)
          };
          break;
        case 53:
          message.content = {
            oneofKind: "gpioGetPinMode",
            gpioGetPinMode: GetPinMode.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioGetPinMode)
          };
          break;
        case 54:
          message.content = {
            oneofKind: "gpioGetPinModeResponse",
            gpioGetPinModeResponse: GetPinModeResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioGetPinModeResponse)
          };
          break;
        case 55:
          message.content = {
            oneofKind: "gpioReadPin",
            gpioReadPin: ReadPin.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioReadPin)
          };
          break;
        case 56:
          message.content = {
            oneofKind: "gpioReadPinResponse",
            gpioReadPinResponse: ReadPinResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioReadPinResponse)
          };
          break;
        case 57:
          message.content = {
            oneofKind: "gpioWritePin",
            gpioWritePin: WritePin.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioWritePin)
          };
          break;
        case 72:
          message.content = {
            oneofKind: "gpioGetOtgMode",
            gpioGetOtgMode: GetOtgMode.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioGetOtgMode)
          };
          break;
        case 73:
          message.content = {
            oneofKind: "gpioGetOtgModeResponse",
            gpioGetOtgModeResponse: GetOtgModeResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioGetOtgModeResponse)
          };
          break;
        case 74:
          message.content = {
            oneofKind: "gpioSetOtgMode",
            gpioSetOtgMode: SetOtgMode.internalBinaryRead(reader, reader.uint32(), options, message.content.gpioSetOtgMode)
          };
          break;
        case 58:
          message.content = {
            oneofKind: "appStateResponse",
            appStateResponse: AppStateResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.appStateResponse)
          };
          break;
        case 61:
          message.content = {
            oneofKind: "propertyGetRequest",
            propertyGetRequest: GetRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.propertyGetRequest)
          };
          break;
        case 62:
          message.content = {
            oneofKind: "propertyGetResponse",
            propertyGetResponse: GetResponse.internalBinaryRead(reader, reader.uint32(), options, message.content.propertyGetResponse)
          };
          break;
        case 66:
          message.content = {
            oneofKind: "desktopIsLockedRequest",
            desktopIsLockedRequest: IsLockedRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.desktopIsLockedRequest)
          };
          break;
        case 67:
          message.content = {
            oneofKind: "desktopUnlockRequest",
            desktopUnlockRequest: UnlockRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.desktopUnlockRequest)
          };
          break;
        case 68:
          message.content = {
            oneofKind: "desktopStatusSubscribeRequest",
            desktopStatusSubscribeRequest: StatusSubscribeRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.desktopStatusSubscribeRequest)
          };
          break;
        case 69:
          message.content = {
            oneofKind: "desktopStatusUnsubscribeRequest",
            desktopStatusUnsubscribeRequest: StatusUnsubscribeRequest.internalBinaryRead(reader, reader.uint32(), options, message.content.desktopStatusUnsubscribeRequest)
          };
          break;
        case 70:
          message.content = {
            oneofKind: "desktopStatus",
            desktopStatus: Status.internalBinaryRead(reader, reader.uint32(), options, message.content.desktopStatus)
          };
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.commandId !== 0)
      writer.tag(1, WireType.Varint).uint32(message.commandId);
    if (message.commandStatus !== 0)
      writer.tag(2, WireType.Varint).int32(message.commandStatus);
    if (message.hasNext !== false)
      writer.tag(3, WireType.Varint).bool(message.hasNext);
    if (message.content.oneofKind === "empty")
      Empty.internalBinaryWrite(message.content.empty, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemPingRequest")
      PingRequest.internalBinaryWrite(message.content.systemPingRequest, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemPingResponse")
      PingResponse.internalBinaryWrite(message.content.systemPingResponse, writer.tag(6, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageListRequest")
      ListRequest.internalBinaryWrite(message.content.storageListRequest, writer.tag(7, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageListResponse")
      ListResponse.internalBinaryWrite(message.content.storageListResponse, writer.tag(8, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageReadRequest")
      ReadRequest.internalBinaryWrite(message.content.storageReadRequest, writer.tag(9, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageReadResponse")
      ReadResponse.internalBinaryWrite(message.content.storageReadResponse, writer.tag(10, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageWriteRequest")
      WriteRequest.internalBinaryWrite(message.content.storageWriteRequest, writer.tag(11, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageDeleteRequest")
      DeleteRequest.internalBinaryWrite(message.content.storageDeleteRequest, writer.tag(12, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageMkdirRequest")
      MkdirRequest.internalBinaryWrite(message.content.storageMkdirRequest, writer.tag(13, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageMd5SumRequest")
      Md5sumRequest.internalBinaryWrite(message.content.storageMd5SumRequest, writer.tag(14, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageMd5SumResponse")
      Md5sumResponse.internalBinaryWrite(message.content.storageMd5SumResponse, writer.tag(15, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appStartRequest")
      StartRequest.internalBinaryWrite(message.content.appStartRequest, writer.tag(16, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appLockStatusRequest")
      LockStatusRequest.internalBinaryWrite(message.content.appLockStatusRequest, writer.tag(17, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appLockStatusResponse")
      LockStatusResponse.internalBinaryWrite(message.content.appLockStatusResponse, writer.tag(18, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "stopSession")
      StopSession.internalBinaryWrite(message.content.stopSession, writer.tag(19, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiStartScreenStreamRequest")
      StartScreenStreamRequest.internalBinaryWrite(message.content.guiStartScreenStreamRequest, writer.tag(20, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiStopScreenStreamRequest")
      StopScreenStreamRequest.internalBinaryWrite(message.content.guiStopScreenStreamRequest, writer.tag(21, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiScreenFrame")
      ScreenFrame.internalBinaryWrite(message.content.guiScreenFrame, writer.tag(22, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiSendInputEventRequest")
      SendInputEventRequest.internalBinaryWrite(message.content.guiSendInputEventRequest, writer.tag(23, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageStatRequest")
      StatRequest.internalBinaryWrite(message.content.storageStatRequest, writer.tag(24, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageStatResponse")
      StatResponse.internalBinaryWrite(message.content.storageStatResponse, writer.tag(25, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiStartVirtualDisplayRequest")
      StartVirtualDisplayRequest.internalBinaryWrite(message.content.guiStartVirtualDisplayRequest, writer.tag(26, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "guiStopVirtualDisplayRequest")
      StopVirtualDisplayRequest.internalBinaryWrite(message.content.guiStopVirtualDisplayRequest, writer.tag(27, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageInfoRequest")
      InfoRequest.internalBinaryWrite(message.content.storageInfoRequest, writer.tag(28, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageInfoResponse")
      InfoResponse.internalBinaryWrite(message.content.storageInfoResponse, writer.tag(29, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageRenameRequest")
      RenameRequest.internalBinaryWrite(message.content.storageRenameRequest, writer.tag(30, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemRebootRequest")
      RebootRequest.internalBinaryWrite(message.content.systemRebootRequest, writer.tag(31, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemDeviceInfoRequest")
      DeviceInfoRequest.internalBinaryWrite(message.content.systemDeviceInfoRequest, writer.tag(32, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemDeviceInfoResponse")
      DeviceInfoResponse.internalBinaryWrite(message.content.systemDeviceInfoResponse, writer.tag(33, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemFactoryResetRequest")
      FactoryResetRequest.internalBinaryWrite(message.content.systemFactoryResetRequest, writer.tag(34, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemGetDatetimeRequest")
      GetDateTimeRequest.internalBinaryWrite(message.content.systemGetDatetimeRequest, writer.tag(35, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemGetDatetimeResponse")
      GetDateTimeResponse.internalBinaryWrite(message.content.systemGetDatetimeResponse, writer.tag(36, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemSetDatetimeRequest")
      SetDateTimeRequest.internalBinaryWrite(message.content.systemSetDatetimeRequest, writer.tag(37, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemPlayAudiovisualAlertRequest")
      PlayAudiovisualAlertRequest.internalBinaryWrite(message.content.systemPlayAudiovisualAlertRequest, writer.tag(38, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemProtobufVersionRequest")
      ProtobufVersionRequest.internalBinaryWrite(message.content.systemProtobufVersionRequest, writer.tag(39, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemProtobufVersionResponse")
      ProtobufVersionResponse.internalBinaryWrite(message.content.systemProtobufVersionResponse, writer.tag(40, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemUpdateRequest")
      UpdateRequest.internalBinaryWrite(message.content.systemUpdateRequest, writer.tag(41, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageBackupCreateRequest")
      BackupCreateRequest.internalBinaryWrite(message.content.storageBackupCreateRequest, writer.tag(42, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageBackupRestoreRequest")
      BackupRestoreRequest.internalBinaryWrite(message.content.storageBackupRestoreRequest, writer.tag(43, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemPowerInfoRequest")
      PowerInfoRequest.internalBinaryWrite(message.content.systemPowerInfoRequest, writer.tag(44, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemPowerInfoResponse")
      PowerInfoResponse.internalBinaryWrite(message.content.systemPowerInfoResponse, writer.tag(45, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "systemUpdateResponse")
      UpdateResponse.internalBinaryWrite(message.content.systemUpdateResponse, writer.tag(46, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appExitRequest")
      AppExitRequest.internalBinaryWrite(message.content.appExitRequest, writer.tag(47, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appLoadFileRequest")
      AppLoadFileRequest.internalBinaryWrite(message.content.appLoadFileRequest, writer.tag(48, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appButtonPressRequest")
      AppButtonPressRequest.internalBinaryWrite(message.content.appButtonPressRequest, writer.tag(49, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appButtonReleaseRequest")
      AppButtonReleaseRequest.internalBinaryWrite(message.content.appButtonReleaseRequest, writer.tag(50, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioSetPinMode")
      SetPinMode.internalBinaryWrite(message.content.gpioSetPinMode, writer.tag(51, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioSetInputPull")
      SetInputPull.internalBinaryWrite(message.content.gpioSetInputPull, writer.tag(52, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioGetPinMode")
      GetPinMode.internalBinaryWrite(message.content.gpioGetPinMode, writer.tag(53, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioGetPinModeResponse")
      GetPinModeResponse.internalBinaryWrite(message.content.gpioGetPinModeResponse, writer.tag(54, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioReadPin")
      ReadPin.internalBinaryWrite(message.content.gpioReadPin, writer.tag(55, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioReadPinResponse")
      ReadPinResponse.internalBinaryWrite(message.content.gpioReadPinResponse, writer.tag(56, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioWritePin")
      WritePin.internalBinaryWrite(message.content.gpioWritePin, writer.tag(57, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appStateResponse")
      AppStateResponse.internalBinaryWrite(message.content.appStateResponse, writer.tag(58, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageTimestampRequest")
      TimestampRequest.internalBinaryWrite(message.content.storageTimestampRequest, writer.tag(59, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageTimestampResponse")
      TimestampResponse.internalBinaryWrite(message.content.storageTimestampResponse, writer.tag(60, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "propertyGetRequest")
      GetRequest.internalBinaryWrite(message.content.propertyGetRequest, writer.tag(61, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "propertyGetResponse")
      GetResponse.internalBinaryWrite(message.content.propertyGetResponse, writer.tag(62, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appGetErrorRequest")
      GetErrorRequest.internalBinaryWrite(message.content.appGetErrorRequest, writer.tag(63, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appGetErrorResponse")
      GetErrorResponse.internalBinaryWrite(message.content.appGetErrorResponse, writer.tag(64, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appDataExchangeRequest")
      DataExchangeRequest.internalBinaryWrite(message.content.appDataExchangeRequest, writer.tag(65, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "desktopIsLockedRequest")
      IsLockedRequest.internalBinaryWrite(message.content.desktopIsLockedRequest, writer.tag(66, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "desktopUnlockRequest")
      UnlockRequest.internalBinaryWrite(message.content.desktopUnlockRequest, writer.tag(67, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "desktopStatusSubscribeRequest")
      StatusSubscribeRequest.internalBinaryWrite(message.content.desktopStatusSubscribeRequest, writer.tag(68, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "desktopStatusUnsubscribeRequest")
      StatusUnsubscribeRequest.internalBinaryWrite(message.content.desktopStatusUnsubscribeRequest, writer.tag(69, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "desktopStatus")
      Status.internalBinaryWrite(message.content.desktopStatus, writer.tag(70, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "storageTarExtractRequest")
      TarExtractRequest.internalBinaryWrite(message.content.storageTarExtractRequest, writer.tag(71, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioGetOtgMode")
      GetOtgMode.internalBinaryWrite(message.content.gpioGetOtgMode, writer.tag(72, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioGetOtgModeResponse")
      GetOtgModeResponse.internalBinaryWrite(message.content.gpioGetOtgModeResponse, writer.tag(73, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "gpioSetOtgMode")
      SetOtgMode.internalBinaryWrite(message.content.gpioSetOtgMode, writer.tag(74, WireType.LengthDelimited).fork(), options).join();
    if (message.content.oneofKind === "appButtonPressReleaseRequest")
      AppButtonPressReleaseRequest.internalBinaryWrite(message.content.appButtonPressReleaseRequest, writer.tag(75, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Main = new Main$Type;

class Region$Type extends MessageType {
  constructor() {
    super("PB.Region", [
      { no: 1, name: "country_code", kind: "scalar", T: 12 },
      { no: 2, name: "bands", kind: "message", repeat: 2, T: () => Region_Band }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.countryCode = new Uint8Array(0);
    message.bands = [];
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.countryCode = reader.bytes();
          break;
        case 2:
          message.bands.push(Region_Band.internalBinaryRead(reader, reader.uint32(), options));
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.countryCode.length)
      writer.tag(1, WireType.LengthDelimited).bytes(message.countryCode);
    for (let i = 0;i < message.bands.length; i++)
      Region_Band.internalBinaryWrite(message.bands[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Region = new Region$Type;

class Region_Band$Type extends MessageType {
  constructor() {
    super("PB.Region.Band", [
      { no: 1, name: "start", kind: "scalar", T: 13 },
      { no: 2, name: "end", kind: "scalar", T: 13 },
      { no: 3, name: "power_limit", kind: "scalar", T: 5 },
      { no: 4, name: "duty_cycle", kind: "scalar", T: 13 }
    ]);
  }
  create(value) {
    const message = globalThis.Object.create(this.messagePrototype);
    message.start = 0;
    message.end = 0;
    message.powerLimit = 0;
    message.dutyCycle = 0;
    if (value !== undefined)
      reflectionMergePartial(this, message, value);
    return message;
  }
  internalBinaryRead(reader, length, options, target) {
    let message = target ?? this.create(), end = reader.pos + length;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          message.start = reader.uint32();
          break;
        case 2:
          message.end = reader.uint32();
          break;
        case 3:
          message.powerLimit = reader.int32();
          break;
        case 4:
          message.dutyCycle = reader.uint32();
          break;
        default:
          let u = options.readUnknownField;
          if (u === "throw")
            throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
          let d = reader.skip(wireType);
          if (u !== false)
            (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
      }
    }
    return message;
  }
  internalBinaryWrite(message, writer, options) {
    if (message.start !== 0)
      writer.tag(1, WireType.Varint).uint32(message.start);
    if (message.end !== 0)
      writer.tag(2, WireType.Varint).uint32(message.end);
    if (message.powerLimit !== 0)
      writer.tag(3, WireType.Varint).int32(message.powerLimit);
    if (message.dutyCycle !== 0)
      writer.tag(4, WireType.Varint).uint32(message.dutyCycle);
    let u = options.writeUnknownFields;
    if (u !== false)
      (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
    return writer;
  }
}
var Region_Band = new Region_Band$Type;

// apps/ide/lib/framing.ts
var MAX_FRAME_BYTES = 1 << 20;

class VarintFramer extends TransformStream {
  constructor(seed) {
    let buf = seed && seed.byteLength > 0 ? new Uint8Array(seed) : new Uint8Array(0);
    let expectedLen = null;
    super({
      transform(chunk, controller) {
        buf = concat(buf, chunk);
        while (true) {
          if (expectedLen === null) {
            const decoded = tryDecodeVarint(buf);
            if (decoded === null)
              return;
            if (decoded.value > MAX_FRAME_BYTES) {
              controller.error(new Error(`Frame length ${decoded.value} exceeds limit`));
              return;
            }
            expectedLen = decoded.value;
            buf = buf.subarray(decoded.bytesRead);
          }
          if (buf.byteLength < expectedLen)
            return;
          const frame = buf.subarray(0, expectedLen);
          controller.enqueue(new Uint8Array(frame));
          buf = buf.subarray(expectedLen);
          expectedLen = null;
        }
      },
      flush() {}
    });
  }
}
function encodeVarintLength(payload) {
  const prefix = encodeVarint(payload.byteLength);
  const out = new Uint8Array(prefix.byteLength + payload.byteLength);
  out.set(prefix, 0);
  out.set(payload, prefix.byteLength);
  return out;
}
function encodeVarint(value) {
  if (value < 0 || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`encodeVarint: bad value ${value}`);
  }
  const bytes = [];
  let v = value;
  while (v > 127) {
    bytes.push(v & 127 | 128);
    v >>>= 7;
  }
  bytes.push(v & 127);
  return Uint8Array.from(bytes);
}
function tryDecodeVarint(buf) {
  let value = 0;
  let shift = 0;
  for (let i = 0;i < buf.byteLength; i++) {
    const byte = buf[i];
    value |= (byte & 127) << shift;
    if ((byte & 128) === 0) {
      return { value: value >>> 0, bytesRead: i + 1 };
    }
    shift += 7;
    if (shift >= 35) {
      throw new Error("Varint too long; stream corrupt?");
    }
  }
  return null;
}
function concat(a, b) {
  if (a.byteLength === 0)
    return b;
  if (b.byteLength === 0)
    return a;
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(a, 0);
  out.set(b, a.byteLength);
  return out;
}

// apps/ide/lib/client.ts
var DEFAULT_REQUEST_TIMEOUT_MS = 1e4;
async function readWithTimeout(reader, timeoutMs) {
  let timer = null;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  try {
    const result = await Promise.race([
      reader.read().then((r) => r.done ? "closed" : r.value),
      timeoutPromise
    ]);
    return result;
  } finally {
    if (timer)
      clearTimeout(timer);
  }
}
function decodeLatin1(bytes) {
  let s = "";
  for (let i = 0;i < bytes.byteLength; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return s;
}
function concatChunks(chunks) {
  let total = 0;
  for (const c of chunks)
    total += c.byteLength;
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}
function toHexDump(bytes, maxBytes = 128) {
  const slice = bytes.subarray(0, maxBytes);
  const hex = Array.from(slice, (b) => b.toString(16).padStart(2, "0")).join(" ");
  return bytes.byteLength > maxBytes ? `${hex} ... (+${bytes.byteLength - maxBytes} more)` : hex;
}

class FlipperRpcClient extends EventTarget {
  transport = null;
  state = "disconnected";
  writer = null;
  framedReadable = null;
  readLoopPromise = null;
  readAbort = null;
  writeChain = Promise.resolve();
  nextCommandId = 1;
  pending = new Map;
  pendingStream = new Map;
  streamHandlers = new Set;
  getState() {
    return this.state;
  }
  async connect(transport) {
    if (this.state !== "disconnected" && this.state !== "errored") {
      throw new Error(`connect() called in state ${this.state}`);
    }
    this.transport = transport;
    this.setState("connecting");
    let reader = null;
    try {
      this.writer = transport.writable.getWriter();
      reader = transport.readable.getReader();
      await this.writer.write(new TextEncoder().encode("\r"));
      const PROMPT = `\r
>: `;
      const PHASE_A_TIMEOUT_MS = 3000;
      let accumulated = "";
      const collectedRaw = [];
      const phaseADeadline = Date.now() + PHASE_A_TIMEOUT_MS;
      while (!accumulated.endsWith(PROMPT) && !accumulated.includes(PROMPT)) {
        const remaining = phaseADeadline - Date.now();
        if (remaining <= 0) {
          throw new Error(`CLI prompt not received within ${PHASE_A_TIMEOUT_MS / 1000}s. Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}. Is the Flipper unlocked and not in DFU mode?`);
        }
        const chunk = await readWithTimeout(reader, remaining);
        if (chunk === "timeout") {
          throw new Error(`CLI prompt not received within ${PHASE_A_TIMEOUT_MS / 1000}s. Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}. Is the Flipper unlocked and not in DFU mode?`);
        }
        if (chunk === "closed") {
          throw new Error(`Transport closed while waiting for CLI prompt. Last bytes (hex): ${toHexDump(concatChunks(collectedRaw))}.`);
        }
        collectedRaw.push(chunk);
        accumulated += decodeLatin1(chunk);
      }
      await this.writer.write(new TextEncoder().encode("start_rpc_session\r"));
      const PHASE_C_IDLE_MS = 250;
      let prelude = new Uint8Array(0);
      while (true) {
        const chunk = await readWithTimeout(reader, PHASE_C_IDLE_MS);
        if (chunk === "timeout") {
          break;
        }
        if (chunk === "closed") {
          throw new Error("Transport closed during RPC handshake drain.");
        }
        const splitIdx = chunk.findIndex((b) => b >= 128);
        if (splitIdx !== -1) {
          prelude = new Uint8Array(chunk.subarray(splitIdx));
          break;
        }
      }
      reader.releaseLock();
      reader = null;
      this.framedReadable = transport.readable.pipeThrough(new VarintFramer(prelude.byteLength > 0 ? prelude : undefined));
      this.readAbort = new AbortController;
      this.readLoopPromise = this.readLoop(this.framedReadable, this.readAbort.signal);
      this.setState("connected");
    } catch (err) {
      this.setState("errored");
      if (reader) {
        try {
          reader.releaseLock();
        } catch {}
      }
      this.writer = null;
      this.framedReadable = null;
      this.readLoopPromise = null;
      this.readAbort = null;
      this.transport = null;
      throw err;
    }
  }
  async disconnect() {
    if (this.state === "disconnected" || this.state === "disconnecting") {
      return;
    }
    const wasConnected = this.state === "connected";
    this.setState("disconnecting");
    if (wasConnected) {
      try {
        await this.sendOneway({
          commandStatus: 0,
          hasNext: false,
          content: { oneofKind: "stopSession", stopSession: {} }
        });
      } catch {}
    }
    this.readAbort?.abort();
    try {
      if (this.framedReadable && !this.framedReadable.locked) {}
    } catch {}
    if (this.writer) {
      try {
        await this.writer.close();
      } catch {
        try {
          this.writer.releaseLock();
        } catch {}
      }
      this.writer = null;
    }
    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise;
      } catch {}
      this.readLoopPromise = null;
    }
    if (this.transport) {
      try {
        await this.transport.close();
      } catch {}
      this.transport = null;
    }
    for (const [, deferred] of this.pending) {
      if (deferred.timer)
        clearTimeout(deferred.timer);
      deferred.reject(new Error("client disconnected"));
    }
    this.pending.clear();
    for (const [, deferred] of this.pendingStream) {
      if (deferred.timer)
        clearTimeout(deferred.timer);
      deferred.reject(new Error("client disconnected"));
    }
    this.pendingStream.clear();
    this.framedReadable = null;
    this.readAbort = null;
    this.setState("disconnected");
  }
  async sendRequest(req, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    if (this.state !== "connected") {
      throw new Error(`sendRequest() in state ${this.state}`);
    }
    const commandId = this.allocateCommandId();
    const outbound = { ...req, commandId };
    const responsePromise = new Promise((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => {
        const entry = this.pending.get(commandId);
        if (!entry)
          return;
        this.pending.delete(commandId);
        reject(new Error(`request ${commandId} timed out`));
      }, timeoutMs) : null;
      this.pending.set(commandId, { resolve, reject, timer });
    });
    try {
      await this.writeFramed(outbound);
    } catch (err) {
      const entry = this.pending.get(commandId);
      if (entry) {
        if (entry.timer)
          clearTimeout(entry.timer);
        this.pending.delete(commandId);
      }
      throw err;
    }
    return responsePromise.finally(() => {
      const entry = this.pending.get(commandId);
      if (entry?.timer)
        clearTimeout(entry.timer);
    });
  }
  async sendOneway(req) {
    if (this.state !== "connected" && this.state !== "disconnecting") {
      throw new Error(`sendOneway() in state ${this.state}`);
    }
    const commandId = this.allocateCommandId();
    const outbound = { ...req, commandId };
    await this.writeFramed(outbound);
  }
  async sendChunkedRequest(chunks, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    if (this.state !== "connected") {
      throw new Error(`sendChunkedRequest() in state ${this.state}`);
    }
    if (chunks.length === 0) {
      throw new Error("sendChunkedRequest() requires at least one chunk");
    }
    const commandId = this.allocateCommandId();
    const responsePromise = new Promise((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => {
        const entry = this.pending.get(commandId);
        if (!entry)
          return;
        this.pending.delete(commandId);
        reject(new Error(`request ${commandId} timed out`));
      }, timeoutMs) : null;
      this.pending.set(commandId, { resolve, reject, timer });
    });
    try {
      for (const chunk of chunks) {
        const outbound = { ...chunk, commandId };
        await this.writeFramed(outbound);
      }
    } catch (err) {
      const entry = this.pending.get(commandId);
      if (entry) {
        if (entry.timer)
          clearTimeout(entry.timer);
        this.pending.delete(commandId);
      }
      throw err;
    }
    return responsePromise.finally(() => {
      const entry = this.pending.get(commandId);
      if (entry?.timer)
        clearTimeout(entry.timer);
    });
  }
  async sendStreamingRequest(req, onFrame, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    if (this.state !== "connected") {
      throw new Error(`sendStreamingRequest() in state ${this.state}`);
    }
    const commandId = this.allocateCommandId();
    const outbound = { ...req, commandId };
    const responsePromise = new Promise((resolve, reject) => {
      const timer = timeoutMs > 0 ? setTimeout(() => {
        const entry = this.pendingStream.get(commandId);
        if (!entry)
          return;
        this.pendingStream.delete(commandId);
        reject(new Error(`request ${commandId} timed out`));
      }, timeoutMs) : null;
      this.pendingStream.set(commandId, { onFrame, resolve, reject, timer });
    });
    try {
      await this.writeFramed(outbound);
    } catch (err) {
      const entry = this.pendingStream.get(commandId);
      if (entry) {
        if (entry.timer)
          clearTimeout(entry.timer);
        this.pendingStream.delete(commandId);
      }
      throw err;
    }
    return responsePromise.finally(() => {
      const entry = this.pendingStream.get(commandId);
      if (entry?.timer)
        clearTimeout(entry.timer);
    });
  }
  onStreamMessage(handler) {
    this.streamHandlers.add(handler);
    return () => {
      this.streamHandlers.delete(handler);
    };
  }
  dispatch(msg) {
    this.dispatchEvent(new CustomEvent("message", { detail: { msg } }));
    if (msg.commandId === 0) {
      for (const h of this.streamHandlers)
        h(msg);
      return;
    }
    const streaming = this.pendingStream.get(msg.commandId);
    if (streaming) {
      streaming.onFrame(msg);
      if (!msg.hasNext) {
        this.pendingStream.delete(msg.commandId);
        if (streaming.timer)
          clearTimeout(streaming.timer);
        streaming.resolve(msg);
      }
      return;
    }
    const pending = this.pending.get(msg.commandId);
    if (!pending) {
      return;
    }
    this.pending.delete(msg.commandId);
    if (pending.timer)
      clearTimeout(pending.timer);
    pending.resolve(msg);
  }
  setState(next) {
    if (this.state === next)
      return;
    this.state = next;
    this.dispatchEvent(new CustomEvent("state", {
      detail: { state: next }
    }));
  }
  getTransport() {
    return this.transport;
  }
  peekNextCommandId() {
    return this.nextCommandId;
  }
  allocateCommandId() {
    const id = this.nextCommandId++;
    if (this.nextCommandId === 0)
      this.nextCommandId = 1;
    return id;
  }
  writeFramed(msg) {
    const writer = this.writer;
    if (!writer) {
      return Promise.reject(new Error("transport writer not available"));
    }
    const payload = Main.toBinary(msg);
    const framed = encodeVarintLength(payload);
    const next = this.writeChain.then(() => writer.write(framed));
    this.writeChain = next.catch(() => {});
    return next;
  }
  async readLoop(framed, signal) {
    const reader = framed.getReader();
    const onAbort = () => {
      reader.cancel(new Error("read loop aborted")).catch(() => {});
    };
    signal.addEventListener("abort", onAbort, { once: true });
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done)
          return;
        if (!value)
          continue;
        let msg;
        try {
          msg = Main.fromBinary(value);
        } catch (err) {
          this.failPending(err);
          this.setState("errored");
          return;
        }
        this.dispatch(msg);
      }
    } catch (err) {
      if (!signal.aborted) {
        this.failPending(err);
        this.setState("errored");
      }
    } finally {
      signal.removeEventListener("abort", onAbort);
      try {
        reader.releaseLock();
      } catch {}
    }
  }
  failPending(err) {
    for (const [, deferred] of this.pending) {
      if (deferred.timer)
        clearTimeout(deferred.timer);
      deferred.reject(err);
    }
    this.pending.clear();
    for (const [, deferred] of this.pendingStream) {
      if (deferred.timer)
        clearTimeout(deferred.timer);
      deferred.reject(err);
    }
    this.pendingStream.clear();
  }
}
// apps/ide/lib/gui.ts
var KEY_MAP = {
  up: InputKey.UP,
  down: InputKey.DOWN,
  left: InputKey.LEFT,
  right: InputKey.RIGHT,
  ok: InputKey.OK,
  back: InputKey.BACK
};
var TYPE_MAP = {
  press: InputType.PRESS,
  release: InputType.RELEASE,
  short: InputType.SHORT,
  long: InputType.LONG,
  repeat: InputType.REPEAT
};
async function startScreenStream(client, onFrame) {
  const unsubscribe = client.onStreamMessage((msg) => {
    if (msg.content.oneofKind !== "guiScreenFrame")
      return;
    const frame = msg.content.guiScreenFrame;
    onFrame({ data: frame.data, orientation: frame.orientation });
  });
  let started = false;
  try {
    const response = await client.sendRequest({
      commandStatus: 0,
      hasNext: false,
      content: {
        oneofKind: "guiStartScreenStreamRequest",
        guiStartScreenStreamRequest: {}
      }
    });
    if (response.commandStatus !== CommandStatus.OK) {
      const name = CommandStatus[response.commandStatus] ?? response.commandStatus;
      throw new Error(`startScreenStream failed: ${name}`);
    }
    started = true;
  } finally {
    if (!started)
      unsubscribe();
  }
  let cancelled = false;
  return async () => {
    if (cancelled)
      return;
    cancelled = true;
    unsubscribe();
    try {
      await stopScreenStream(client);
    } catch {}
  };
}
async function stopScreenStream(client) {
  await client.sendOneway({
    commandStatus: 0,
    hasNext: false,
    content: {
      oneofKind: "guiStopScreenStreamRequest",
      guiStopScreenStreamRequest: {}
    }
  });
}
async function sendInput(client, key, type) {
  const pbKey = KEY_MAP[key];
  if (pbKey === undefined)
    throw new Error(`unknown input key: ${key}`);
  const pbType = TYPE_MAP[type];
  if (pbType === undefined)
    throw new Error(`unknown input type: ${type}`);
  await client.sendOneway({
    commandStatus: 0,
    hasNext: false,
    content: {
      oneofKind: "guiSendInputEventRequest",
      guiSendInputEventRequest: { key: pbKey, type: pbType }
    }
  });
}
// apps/ide/ui/screen-canvas.ts
var SCREEN_WIDTH = 128;
var SCREEN_HEIGHT = 64;
var SCREEN_BYTES = SCREEN_WIDTH * SCREEN_HEIGHT / 8;
class ScreenCanvas {
  canvas;
  ctx;
  scale;
  fg;
  bg;
  image;
  fgRgba;
  bgRgba;
  currentOrientation = 0 /* Horizontal */;
  constructor(canvas, opts = {}) {
    this.scale = Math.max(1, Math.floor(opts.scale ?? 5));
    this.fg = opts.fg ?? "#1a1a1a";
    this.bg = opts.bg ?? "#ff8200";
    this.canvas = canvas;
    this.applyCanvasSize(0 /* Horizontal */);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx)
      throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.fgRgba = parseCssColor(this.fg);
    this.bgRgba = parseCssColor(this.bg);
    this.image = this.ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.clear();
  }
  get orientation() {
    return this.currentOrientation;
  }
  applyCanvasSize(orientation) {
    const portrait = orientation === 2 /* Vertical */ || orientation === 3 /* VerticalFlip */;
    const w = (portrait ? SCREEN_HEIGHT : SCREEN_WIDTH) * this.scale;
    const h = (portrait ? SCREEN_WIDTH : SCREEN_HEIGHT) * this.scale;
    if (this.canvas.width !== w)
      this.canvas.width = w;
    if (this.canvas.height !== h)
      this.canvas.height = h;
  }
  drawFrame(framebuffer, orientation = 0 /* Horizontal */) {
    if (framebuffer.byteLength !== SCREEN_BYTES) {
      throw new Error(`ScreenCanvas.drawFrame: expected ${SCREEN_BYTES} bytes, got ${framebuffer.byteLength}`);
    }
    if (orientation !== this.currentOrientation) {
      this.currentOrientation = orientation;
      this.applyCanvasSize(orientation);
    }
    const data = this.image.data;
    const [fr, fg, fb, fa] = this.fgRgba;
    const [br, bg, bb, ba] = this.bgRgba;
    for (let y = 0;y < SCREEN_HEIGHT; y++) {
      const page = y >> 3;
      const bitMask = 1 << (y & 7);
      const rowBase = page * SCREEN_WIDTH;
      for (let x = 0;x < SCREEN_WIDTH; x++) {
        const lit = (framebuffer[rowBase + x] & bitMask) !== 0;
        const i = (y * SCREEN_WIDTH + x) * 4;
        if (lit) {
          data[i] = fr;
          data[i + 1] = fg;
          data[i + 2] = fb;
          data[i + 3] = fa;
        } else {
          data[i] = br;
          data[i + 1] = bg;
          data[i + 2] = bb;
          data[i + 3] = ba;
        }
      }
    }
    this.blit();
  }
  clear() {
    const data = this.image.data;
    const [br, bg, bb, ba] = this.bgRgba;
    for (let i = 0;i < data.length; i += 4) {
      data[i] = br;
      data[i + 1] = bg;
      data[i + 2] = bb;
      data[i + 3] = ba;
    }
    this.blit();
  }
  blit() {
    const tmp = document.createElement("canvas");
    tmp.width = SCREEN_WIDTH;
    tmp.height = SCREEN_HEIGHT;
    const tctx = tmp.getContext("2d");
    if (!tctx)
      return;
    tctx.putImageData(this.image, 0, 0);
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sw = SCREEN_WIDTH * this.scale;
    const sh = SCREEN_HEIGHT * this.scale;
    switch (this.currentOrientation) {
      case 1 /* HorizontalFlip */:
        ctx.translate(cw, ch);
        ctx.rotate(Math.PI);
        break;
      case 2 /* Vertical */:
        ctx.translate(cw, 0);
        ctx.rotate(Math.PI / 2);
        break;
      case 3 /* VerticalFlip */:
        ctx.translate(0, ch);
        ctx.rotate(-Math.PI / 2);
        break;
      default:
        break;
    }
    ctx.drawImage(tmp, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, sw, sh);
    ctx.restore();
  }
}
function parseCssColor(c) {
  const m3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(c);
  if (m3) {
    return [
      parseInt(m3[1] + m3[1], 16),
      parseInt(m3[2] + m3[2], 16),
      parseInt(m3[3] + m3[3], 16),
      255
    ];
  }
  const m6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
  if (m6) {
    return [
      parseInt(m6[1], 16),
      parseInt(m6[2], 16),
      parseInt(m6[3], 16),
      255
    ];
  }
  return [255, 255, 255, 255];
}
export {
  stopScreenStream,
  startScreenStream,
  sendInput,
  requestFlipperPort,
  getGrantedFlipperPort,
  WebSerialTransport,
  ScreenCanvas,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_BYTES,
  FlipperRpcClient
};
