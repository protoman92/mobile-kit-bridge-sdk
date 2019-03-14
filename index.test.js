import "@babel/polyfill";
import {
  createModuleMethodParameter,
  wrapAndroidModule,
  wrapIOSModule
} from ".";

var globalObject = {};

function formatResult(arg1, arg2) {
  return `Arg1: ${arg1}, Arg2: ${arg2}`;
}

function formatError(arg) {
  return `Error for arg ${arg}`;
}

class TestADRModule {
  getSomething(id, arg1, arg2) {
    const result = formatResult(arg1, arg2);
    globalObject.TestADRModule_getSomethingCallback(id, result);
  }

  throwError(id, arg) {
    const error = { isError: true, message: formatError(arg) };
    globalObject.TestADRModule_throwErrorCallback(id, error);
  }
}

function TestIOSModule() {
  return {
    postMessage: ({ method, requestID, ...rest }) => {
      switch (method) {
        case "getSomething":
          const { arg1, arg2 } = rest;
          const result = formatResult(arg1, arg2);
          globalObject.TestIOSModule_getSomethingCallback(requestID, result);
          break;

        case "throwError":
          const error = { isError: true, message: formatError(rest.arg) };
          globalObject.TestIOSModule_throwErrorCallback(requestID, error);
          break;
      }
    }
  };
}

describe("Module wrappers should wrap platform modules correctly", () => {
  async function testModuleMethodWithNormalReturn(createModuleFunc) {
    // Setup
    const arg1 = "1";
    const arg2 = "2";

    // When
    const wrappedModule = createModuleFunc();

    const result = await wrappedModule.invoke(
      "getSomething",
      createModuleMethodParameter("arg1", arg1),
      createModuleMethodParameter("arg2", arg2)
    );

    // Then
    expect(result).toEqual(formatResult(arg1, arg2));
  }

  async function testModuleMethodWithError(createModuleFunc) {
    // Setup
    const arg = "1";

    // When
    const wrappedModule = createModuleFunc();

    try {
      // Then
      await wrappedModule.invoke(
        "throwError",
        createModuleMethodParameter("arg", arg)
      );

      throw new Error("Never should have come here");
    } catch (e) {
      expect(e).toEqual({ isError: true, message: formatError(arg) });
    }
  }

  beforeEach(() => {
    globalObject = {};
  });

  it("Should wrap Android module correctly", async () => {
    await testModuleMethodWithNormalReturn(() =>
      wrapAndroidModule(globalObject, "TestADRModule", new TestADRModule())
    );

    await testModuleMethodWithError(() =>
      wrapAndroidModule(globalObject, "TestADRModule", new TestADRModule())
    );
  });

  it("Should wrap iOS module correctly", async () => {
    await testModuleMethodWithNormalReturn(() =>
      wrapIOSModule(globalObject, "TestIOSModule", TestIOSModule())
    );

    await testModuleMethodWithError((kitName, kit) =>
      wrapIOSModule(globalObject, "TestIOSModule", TestIOSModule())
    );
  });
});