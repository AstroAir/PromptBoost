/**
 * @fileoverview Tests for file loading error handling
 * Verifies that the extension gracefully handles missing files
 */

describe('File Loading Error Handling', () => {
  let originalImportScripts;
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    // Mock importScripts
    originalImportScripts = global.importScripts;
    global.importScripts = jest.fn();

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    global.importScripts = originalImportScripts;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('safeImportScripts should handle successful imports', () => {
    // Mock successful import
    global.importScripts.mockImplementation(() => {});

    // Define the function (from background.js)
    function safeImportScripts(scripts, category) {
      let allLoaded = true;
      const failedScripts = [];

      for (const script of scripts) {
        try {
          importScripts(script);
          console.log(`✓ Loaded ${category}: ${script}`);
        } catch (error) {
          console.error(`✗ Failed to load ${category}: ${script}`, error);
          failedScripts.push(script);
          allLoaded = false;
        }
      }

      if (failedScripts.length > 0) {
        console.warn(`Failed to load ${failedScripts.length} ${category} scripts:`, failedScripts);
      }

      return allLoaded;
    }

    const result = safeImportScripts(['test1.js', 'test2.js'], 'test');

    expect(result).toBe(true);
    expect(global.importScripts).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith('✓ Loaded test: test1.js');
    expect(consoleLogSpy).toHaveBeenCalledWith('✓ Loaded test: test2.js');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('safeImportScripts should handle failed imports gracefully', () => {
    // Mock failed import
    global.importScripts.mockImplementation((script) => {
      if (script === 'missing.js') {
        throw new Error('ERR_FILE_NOT_FOUND');
      }
    });

    function safeImportScripts(scripts, category) {
      let allLoaded = true;
      const failedScripts = [];

      for (const script of scripts) {
        try {
          importScripts(script);
          console.log(`✓ Loaded ${category}: ${script}`);
        } catch (error) {
          console.error(`✗ Failed to load ${category}: ${script}`, error);
          failedScripts.push(script);
          allLoaded = false;
        }
      }

      if (failedScripts.length > 0) {
        console.warn(`Failed to load ${failedScripts.length} ${category} scripts:`, failedScripts);
      }

      return allLoaded;
    }

    const result = safeImportScripts(['working.js', 'missing.js'], 'test');

    expect(result).toBe(false);
    expect(global.importScripts).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith('✓ Loaded test: working.js');
    expect(consoleErrorSpy).toHaveBeenCalledWith('✗ Failed to load test: missing.js', expect.any(Error));
    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to load 1 test scripts:', ['missing.js']);
  });

  test('safeInitializeService should handle service creation errors', () => {
    function safeInitializeService(serviceFactory, serviceName) {
      try {
        const service = serviceFactory();
        console.log(`✓ ${serviceName} initialized successfully`);
        return service;
      } catch (error) {
        console.error(`✗ Failed to initialize ${serviceName}:`, error);
        return null;
      }
    }

    // Test successful initialization
    const workingService = safeInitializeService(() => ({ name: 'TestService' }), 'TestService');
    expect(workingService).toEqual({ name: 'TestService' });
    expect(consoleLogSpy).toHaveBeenCalledWith('✓ TestService initialized successfully');

    // Test failed initialization
    const failingService = safeInitializeService(() => {
      throw new Error('Service creation failed');
    }, 'FailingService');
    expect(failingService).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('✗ Failed to initialize FailingService:', expect.any(Error));
  });

  test('should continue working with partial failures', () => {
    // Simulate a scenario where some services fail to load but others succeed
    const services = [];
    
    function safeInitializeService(serviceFactory, serviceName) {
      try {
        const service = serviceFactory();
        console.log(`✓ ${serviceName} initialized successfully`);
        return service;
      } catch (error) {
        console.error(`✗ Failed to initialize ${serviceName}:`, error);
        return null;
      }
    }

    // Initialize multiple services with some failures
    services.push(safeInitializeService(() => ({ name: 'WorkingService1' }), 'WorkingService1'));
    services.push(safeInitializeService(() => { throw new Error('Failed'); }, 'FailingService'));
    services.push(safeInitializeService(() => ({ name: 'WorkingService2' }), 'WorkingService2'));

    // Should have 2 working services and 1 null
    const workingServices = services.filter(s => s !== null);
    expect(workingServices).toHaveLength(2);
    expect(services).toHaveLength(3);
    expect(services[1]).toBeNull(); // The failing service
  });
});
