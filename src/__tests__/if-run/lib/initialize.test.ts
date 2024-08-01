/* eslint-disable @typescript-eslint/ban-ts-comment */
jest.mock('mockavizta', () => require('../../../__mocks__/plugin'), {
  virtual: true,
});
jest.mock(
  '../../../if-run/builtins',
  () => require('../../../__mocks__/plugin'),
  {
    virtual: true,
  }
);
const mockLog = jest.fn();
jest.mock('../../../if-run/util/log-memoize', () => ({
  memoizedLog: mockLog,
}));

import {ERRORS} from '@grnsft/if-core/utils';

import {initialize} from '../../../if-run/lib/initialize';
import {STRINGS} from '../../../if-run/config';

const {
  MissingPluginPathError,
  MissingPluginMethodError,
  PluginInitializationError,
} = ERRORS;
const {MISSING_METHOD, MISSING_PATH, INVALID_MODULE_PATH} = STRINGS;

describe('lib/initalize: ', () => {
  describe('initalize(): ', () => {
    it('creates instance with get and set methods.', async () => {
      const context = {initialize: {plugins: {}}};
      // @ts-ignore
      const response = await initialize(context);

      expect(response).toHaveProperty('get');
      expect(response).toHaveProperty('set');
      expect(typeof response.get).toEqual('function');
      expect(typeof response.set).toEqual('function');
    });

    it('checks if plugin is initalized, warning is logged and plugin has execute and metadata props.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              method: 'Mockavizta',
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
      expect(mockLog).toHaveBeenCalledTimes(1); // checks if logger is called
    });

    it('checks if plugin is initalized with global config and has execute and metadata.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              method: 'Mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin does not have path property.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              method: 'Mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingPluginPathError);

        if (error instanceof MissingPluginPathError) {
          expect(error.message).toEqual(MISSING_PATH);
        }
      }
    });

    it('throws error if plugin does not have path property.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingPluginMethodError);

        if (error instanceof MissingPluginMethodError) {
          expect(error.message).toEqual(MISSING_METHOD);
        }
      }
    });

    it('checks if builtin plugin is initalized.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'builtin',
              method: 'Mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('checks if time sync plugin is initalized.', async () => {
      const context = {
        initialize: {
          plugins: {
            'time-sync': {
              path: 'lib/time-sync',
              method: 'TimeSync',
              'global-config': {},
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('initalizes time sync based on context.', async () => {
      const context = {
        initialize: {
          plugins: {},
        },
        'time-sync': {
          'start-time': '2024-09-04',
          'end-time': '2024-09-05',
          'allow-padding': true,
          interval: 5,
        },
      };
      // @ts-ignore
      const storage = await initialize(context);
      const module = storage.get('time-sync');

      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('checks if github plugin is initalized.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'https://github.com/mockavizta',
              method: 'Mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };
      // @ts-ignore
      const storage = await initialize(context);

      const pluginName = Object.keys(context.initialize.plugins)[0];
      const module = storage.get(pluginName);
      expect(module).toHaveProperty('execute');
      expect(module).toHaveProperty('metadata');
    });

    it('throws error if plugin path is invalid.', async () => {
      const context = {
        initialize: {
          plugins: {
            mockavizta: {
              path: 'failing-mock',
              method: 'Mockavizta',
              'global-config': {
                verbose: true,
              },
            },
          },
        },
      };

      try {
        // @ts-ignore
        await initialize(context);
      } catch (error: any) {
        expect(error).toBeInstanceOf(PluginInitializationError);
        expect(error.message).toEqual(
          INVALID_MODULE_PATH(
            context.initialize.plugins.mockavizta.path,
            new Error(
              "Cannot find module 'failing-mock' from 'src/if-run/lib/initialize.ts'"
            )
          )
        );
      }
    });
  });
});
