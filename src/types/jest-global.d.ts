/**
 * Minimal ambient declarations for Jest globals.
 *
 * These are a compile-time-only shim so TypeScript can type-check spec files
 * before `node_modules` is installed.  Once you run `npm install`, the full
 * `@types/jest` package takes over — these declarations will be harmlessly
 * superseded (TypeScript merges ambient declarations).
 *
 * DO NOT import from this file.  It is a pure declaration file that TypeScript
 * picks up automatically as part of the src/** include in tsconfig.json.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare function describe(name: string, fn: () => void): void;
declare function fdescribe(name: string, fn: () => void): void;
declare function xdescribe(name: string, fn: () => void): void;

declare function it(name: string, fn: (() => void) | (() => Promise<void>), timeout?: number): void;
declare function fit(
  name: string,
  fn: (() => void) | (() => Promise<void>),
  timeout?: number,
): void;
declare function xit(
  name: string,
  fn: (() => void) | (() => Promise<void>),
  timeout?: number,
): void;
declare function test(
  name: string,
  fn: (() => void) | (() => Promise<void>),
  timeout?: number,
): void;

declare function beforeAll(fn: (() => void) | (() => Promise<void>), timeout?: number): void;
declare function afterAll(fn: (() => void) | (() => Promise<void>), timeout?: number): void;
declare function beforeEach(fn: (() => void) | (() => Promise<void>), timeout?: number): void;
declare function afterEach(fn: (() => void) | (() => Promise<void>), timeout?: number): void;

/** Core jest matchers (subset sufficient for the project's test suite). */
interface JestMatchers<R = void> {
  // equality
  toBe(expected: unknown): R;
  toEqual(expected: unknown): R;
  toStrictEqual(expected: unknown): R;
  // truthiness
  toBeTruthy(): R;
  toBeFalsy(): R;
  toBeNull(): R;
  toBeUndefined(): R;
  toBeDefined(): R;
  // numbers
  toBeGreaterThan(n: number): R;
  toBeGreaterThanOrEqual(n: number): R;
  toBeLessThan(n: number): R;
  toBeLessThanOrEqual(n: number): R;
  toBeCloseTo(number: number, numDigits?: number): R;
  toBeNaN(): R;
  // strings / arrays
  toContain(item: unknown): R;
  toHaveLength(n: number): R;
  toMatch(pattern: string | RegExp): R;
  // objects
  toHaveProperty(keyPath: string | readonly (string | number)[], value?: unknown): R;
  toMatchObject(obj: Record<string, unknown> | unknown[]): R;
  toBeInstanceOf(cls: unknown): R;
  // errors
  toThrow(error?: string | RegExp | Error | (new (...args: unknown[]) => unknown)): R;
  toThrowError(error?: string | RegExp | Error | (new (...args: unknown[]) => unknown)): R;
  // mocks
  toHaveBeenCalled(): R;
  toHaveBeenCalledTimes(n: number | JestAsymmetricMatcher): R;
  toHaveBeenCalledWith(...args: unknown[]): R;
  toHaveBeenLastCalledWith(...args: unknown[]): R;
  toHaveBeenNthCalledWith(nth: number, ...args: unknown[]): R;
  toHaveReturned(): R;
  toHaveReturnedTimes(n: number): R;
  toHaveReturnedWith(value: unknown): R;
  // negation / async
  not: JestMatchers<R>;
  resolves: JestMatchersAsync;
  rejects: JestMatchersAsync;
}

interface JestMatchersAsync {
  toBe(expected: unknown): Promise<void>;
  toEqual(expected: unknown): Promise<void>;
  toThrow(error?: unknown): Promise<void>;
  toHaveProperty(key: string, value?: unknown): Promise<void>;
  [key: string]: (...args: unknown[]) => Promise<void>;
}

interface JestAsymmetricMatcher {
  asymmetricMatch(other: unknown): boolean;
}

declare function expect(value: unknown): JestMatchers;
declare namespace expect {
  function extend(matchers: Record<string, unknown>): void;
  function any(classType: unknown): JestAsymmetricMatcher;
  function anything(): JestAsymmetricMatcher;
  function arrayContaining(sample: unknown[]): JestAsymmetricMatcher;
  function objectContaining(sample: Record<string, unknown>): JestAsymmetricMatcher;
  function stringContaining(expected: string): JestAsymmetricMatcher;
  function stringMatching(expected: string | RegExp): JestAsymmetricMatcher;
}

/** jest.Mock type — returned by jest.fn(). */
interface JestMockFn<TArgs extends any[] = any[], TReturn = any> {
  (...args: TArgs): TReturn;
  mock: {
    calls: TArgs[];
    results: Array<{ type: 'return' | 'throw'; value: TReturn }>;
    instances: unknown[];
    contexts: unknown[];
    lastCall: TArgs;
  };
  mockReturnValue(val: TReturn): this;
  mockReturnValueOnce(val: TReturn): this;
  mockResolvedValue(val: Awaited<TReturn>): this;
  mockResolvedValueOnce(val: Awaited<TReturn>): this;
  mockRejectedValue(val: unknown): this;
  mockRejectedValueOnce(val: unknown): this;
  mockImplementation(fn: (...args: TArgs) => TReturn): this;
  mockImplementationOnce(fn: (...args: TArgs) => TReturn): this;
  mockReturnThis(): this;
  mockClear(): this;
  mockReset(): this;
  mockRestore(): this;
  getMockName(): string;
  mockName(name: string): this;
}

declare namespace jest {
  /** Generic mock function type referenced as `jest.Mock`. */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Mock<T = any, Y extends any[] = any[]> extends JestMockFn<Y, T> {}

  function fn(): Mock;
  function fn<T, Y extends any[] = any[]>(impl: (...args: Y) => T): Mock<T, Y>;

  function spyOn<T extends object, K extends keyof T>(
    object: T,
    method: K,
  ): Mock<T[K] extends (...args: any) => any ? ReturnType<T[K]> : never>;

  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
  function useFakeTimers(): void;
  function useRealTimers(): void;
  function runAllTimers(): void;
  function runAllTimersAsync(): Promise<void>;
  function advanceTimersByTime(ms: number): void;
  function setSystemTime(now?: number | Date): void;

  /** Matched against `ReturnType<typeof jest.fn>` in specs. */
  type MockedFunction<T extends (...args: any) => any> = Mock<ReturnType<T>, Parameters<T>>;
  type Mocked<T> = {
    [P in keyof T]: T[P] extends (...args: any) => any
      ? Mock<ReturnType<T[P]>, Parameters<T[P]>>
      : T[P];
  };
}
