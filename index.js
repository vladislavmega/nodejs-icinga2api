const https = require('https');

class Icinga {
  constructor(hostname, port, user, pass) {
    this.options = {
      hostname,
      timeout: 15000,
      port,
      rejectUnauthorized: false,
      auth: `${user}:${pass}`,
    };
  }

  static wrapAsPromise(callback) {
    let toReturn;

    if (typeof callback !== 'undefined') {
      toReturn = callback;
    } else {
      let resolveHoist;
      let rejectHoist;
      toReturn = new Promise((resolve, reject) => {
        resolveHoist = resolve;
        rejectHoist = reject;
      });

      toReturn.resolve = resolveHoist;
      toReturn.reject = rejectHoist;
    }

    return toReturn;
  }

  static resolveCallback(callback, payload) {
    let toReturn;

    if (typeof callback === 'object' && callback.resolve && typeof callback.resolve === 'function') {
      callback.resolve(payload);
    } else {
      toReturn = callback(null, payload);
    }

    return toReturn;
  }

  static rejectCallback(callback, payload) {
    let toReturn;

    if (typeof callback === 'object' && callback.reject && typeof callback.reject === 'function') {
      callback.reject(payload);
    } else {
      toReturn = callback(payload, null);
    }

    return toReturn;
  }

  getServices(callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let state;

    const options = {
      ...this.options,
      path: '/v1/objects/services',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (successMesage) => {
        state = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
          Statecustom: successMesage,
        }
      });
    });
    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (state.Statuscode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, `${state.Statecustom}`);
      } else {
        toReturn = this.rejectCallback(wrappedCallback, `${state}`);
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  getHosts(callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: '/v1/objects/Hosts',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  getHostFiltered(filter, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let resData = '';

    const options = {
      ...this.options,
      path: '/v1/objects/hosts/',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'GET',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        resData += chunk;
      });

      res.on('end', () => {
        let toReturn;

        if (res.statusCode === '200') {
          const output = JSON.parse(resData);
          toReturn = this.resolveCallback(wrappedCallback, output.results);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      })
    });

    req.end(JSON.stringify(filter));

    return wrappedCallback;
  }

  getServiceFiltered(filter, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let resData = '';

    const options = {
      ...this.options,
      path: '/v1/objects/services/',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'GET',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        resData += chunk;
      });

      res.on('end', () => {
        let toReturn;

        if (res.statusCode === '200') {
          const output = JSON.parse(resData);
          toReturn = this.resolveCallback(wrappedCallback, output.results);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      })
    });

    req.end(JSON.stringify(filter));

    return wrappedCallback;
  }

  getService(ServerName, ServiceName, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let state;

    const options = {
      ...this.options,
      path: `/v1/objects/services/${ServerName}!${ServiceName}`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (successMesage) => {
        state = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
          StateCustom: successMesage,
        }
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (state.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: `${state.Statuscode}`,
          Statecustom: `${state.Statecustom}`,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: state.Statuscode,
          StatusMessage: state.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  getHost(ServerName, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${ServerName}`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });
    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  getServiceWithState(state, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const body = JSON.stringify({
      filter: 'service.state == state',
      filter_vars: {
        state,
      },
    });

    const options = {
      ...this.options,
      path: '/v1/objects/services',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'GET',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          const output = JSON.parse(d);
          toReturn = this.resolveCallback(wrappedCallback, output.results);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });
    req.end(body);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  createHost(template, host, displayname, group, onServer, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const hostObj = JSON.stringify({
      templates: [template],
      attrs: {
        display_name: displayname,
        'vars.group': group,
        'vars.server': onServer,
      },
    });

    this.createHostCustom(hostObj, host, wrappedCallback);
  }

  createService(template, host, service, displayname, gruppe, onServer, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let state;

    const serviceObj = JSON.stringify({
      templates: [template],
      attrs: {
        display_name: displayname,
        'vars.group': gruppe,
        'vars.server': onServer,
      },
    });

    const options = {
      ...this.options,
      path: `/v1/objects/services/${host}!${service}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (successMesage) => {
        state = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
          StateCustom: successMesage,
        }
      });
    });

    req.end(serviceObj);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (state.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, `${state.Statecustom}`);
      } else {
        toReturn = this.rejectCallback(wrappedCallback, `${state.Statecustom}`);
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  createServiceCustom(serviceObj, host, service, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/services/${host}!${service}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end(serviceObj);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  createHostCustom(hostObj, host, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${host}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (statusMessage) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${statusMessage}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end(hostObj);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  deleteHost(host, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${host}?cascade=1`,
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  deleteService(service, host, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/services/${host}!${service}?cascade=1`,
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (stateMessage) => {
        let toReturn;
        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${stateMessage}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  setHostDowntime(dObj, hostname, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;

    const options = {
      ...this.options,
      path: `/v1/actions/schedule-downtime?type=Host&filter=host.name==%22${hostname}%22`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
        };
      });
    });

    req.end(JSON.stringify(dObj));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  setFilteredDowntime(dFilter, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;

    const options = {
      ...this.options,
      path: '/v1/actions/schedule-downtime',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
        }
      })
    });

    req.end(JSON.stringify(dFilter));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  removeFilteredDowntime(dFilter, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;

    const options = {
      ...this.options,
      path: '/v1/actions/remove-downtime',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
        };
      });
    });

    req.end(JSON.stringify(dFilter));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  disableHostNotification(hostname, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;

    const notificationFilter = {
      attrs: {
        enable_notifications: false,
      },
    };

    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${hostname}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
        };
      });
    });

    req.end(JSON.stringify(notificationFilter));

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.StatusCode,
          StatusMessage: statemess.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  setHostState(host, hostState, StateMessage, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;

    const state = {
      exit_status: hostState,
      plugin_output: StateMessage,
    };

    const options = {
      ...this.options,
      path: `/v1/actions/process-check-result?host=${host}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (stateMessage) => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
          StateCustom: stateMessage,
        }
      });
    });

    req.end(JSON.stringify(state));

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.Statuscode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.Statuscode,
          StatusMessage: statemess.StatusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  setServiceState(service, host, serviceState, serviceMessage, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let statemess;
    const state = {
      exit_status: serviceState,
    };

    if (serviceState === 0) {
      state.plugin_output = serviceMessage;
    }
    if (serviceState === 1) {
      state.plugin_output = `WARNING: ${serviceMessage}`;
    }
    if (serviceState === 2) {
      state.plugin_output = `ERROR: ${serviceMessage}`;
    }
    if (serviceState === 3) {
      state.plugin_output = `UNKNOWN: ${serviceMessage}`;
    }

    const options = {
      ...this.options,
      path: `/v1/actions/process-check-result?service=${host}!${service}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (stateMessage) => {
        statemess = {
          Statuscode: res.statusCode,
          StatusMessage: res.statusMessage,
          StateCustom: stateMessage,
        };
      });
    });

    req.end(JSON.stringify(state));

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    req.on('close', () => {
      let toReturn;

      if (statemess.statusCode === '200') {
        toReturn = this.resolveCallback(wrappedCallback, {
          Statuscode: statemess.Statuscode,
          StatusMessage: statemess.StatusMessage,
        });
      } else {
        toReturn = this.rejectCallback(wrappedCallback, {
          Statuscode: statemess.statusCode,
          StatusMessage: statemess.statusMessage,
        });
      }

      return toReturn;
    });

    return wrappedCallback;
  }

  getHostState(hostName, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${hostName}?attrs=state`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          const rs = d.toString();
          const result = JSON.parse(rs).results;
          const output = {
            state: result[0].attrs.state,
            name: result[0].name,
          };

          toReturn = this.resolveCallback(wrappedCallback, output);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  setServicePerfdata(service, server, state, output, perfarr, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let resData = '';
    const postBody = {
      exit_status: state,
      plugin_output: output,
      performance_data: perfarr,
    };

    const options = {
      ...this.options,
      path: `/v1/actions/process-check-result?service=${server}!${service}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        resData += chunk;
      });

      res.on('end', () => {
        let toReturn;

        if (res.statusCode === '200') {
          const outputCb = JSON.parse(resData);
          toReturn = this.resolveCallback(wrappedCallback, outputCb.results);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      })
    });

    req.end(JSON.stringify(postBody));

    return wrappedCallback;
  }

  setHostPerfdata(server, state, output, perfarr, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    let resData = '';
    const postBody = {
      type: 'host',
      exit_status: state,
      plugin_output: output,
      performance_data: perfarr,
    };

    const options = {
      ...this.options,
      path: `/v1/actions/process-check-result?host=${server}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        resData += chunk;
      });

      res.on('end', () => {
        let toReturn;

        if (res.statusCode === '200') {
          const outputCb = JSON.parse(resData);
          toReturn = this.resolveCallback(wrappedCallback, outputCb.results);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      })
    });
    req.end(JSON.stringify(postBody));

    return wrappedCallback;
  }

  updateHostAttr(hostObj, host, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/hosts/${host}`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (statusMessage) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${statusMessage}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end(hostObj);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  updateServiceAttr(serviceObj, host, service, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/objects/services/${host}!${service}`,
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', (successMesage) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${successMesage}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end(serviceObj);

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  getServiceTemplates(callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: '/v1/templates/services',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  checkExistServiceTemplate(name, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/templates/services/${name}`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  getHostTemplates(callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: '/v1/templates/hosts',
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = this.rejectCallback(wrappedCallback, {
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          });
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }

  checkExistHostTemplate(name, callback) {
    const wrappedCallback = this.wrapAsPromise(callback);
    const options = {
      ...this.options,
      path: `/v1/templates/hosts/${name}`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        let toReturn;

        if (res.statusCode === '200') {
          toReturn = this.resolveCallback(wrappedCallback, `${d}`);
        } else {
          toReturn = wrappedCallback({
            Statuscode: res.statusCode,
            StatusMessage: res.statusMessage,
          }, null);
        }

        return toReturn;
      });
    });

    req.end();

    req.on('error', e => this.rejectCallback(wrappedCallback, e));

    return wrappedCallback;
  }
}

module.exports = Icinga;
