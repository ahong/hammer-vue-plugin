/**
 * Vue3自定义指令：https://cn.vuejs.org/guide/reusability/custom-directives.html
 */
function captialize(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return value[0].toUpperCase() + value.substring(1).toLowerCase();
}
function errorHandler(message) {
    throw Error(`[HammerVuePlugin error]: ${message}`);
}

// 存储绑定的识别器配置
const RECOGNIZER_OPTIONS_MAP = new WeakMap();

// 根据事件名称获取识别器类型
function getRecognizerTypeFromEventName(name) {
    if (['tap', 'doubletap'].includes(name)) {
        return 'tap';
    } else if (['pan', 'panstart', 'panmove', 'panend', 'pancancel', 'panleft', 'panright', 'panup', 'pandown'].includes(name)) {
        return 'pan';
    } else if (['swipe', 'swipeleft', 'swiperight', 'swipeup', 'swipedown'].includes(name)) {
        return 'swipe';
    } else if (['press', 'pressup'].includes(name)) {
        return 'press';
    } else if (['pinch', 'pinchstart', 'pinchmove', 'pinchend', 'pinchcancel', 'pinchin', 'pinchout'].includes(name)) {
        return 'pinch';
    } else if (['rotate', 'rotatestart', 'rotatemove', 'rotateend', 'rotatecancel'].includes(name)) {
        return 'rotate';
    } else {
        return 'custom';
    }
}

// 根据事件名称获取识别器的默认配置
function getRecognizerDefaultOptionsFromEventName(name) {
    if (name === 'doubletap') {
        return {
            type: 'tap',
            event: name,
            taps: 2
        };
    }
    return null;
}

/**
 * 给 Manager 添加 recognizer 手势识别器
 * @param {Object} manager Hammer.Manager 实例
 * @param {Object} options recongizer 配置项
 */
function setupRecognizer(manager, options) {
    let type = options.type;
    if (!type) {
        errorHandler('custom event requires type attribute');
        return;
    }

    let name = options.event || options.type;
    if (options.direction) {
        options.direction = Hammer[options.direction];
    }

    let recognizer = manager.get(name);
    if (recognizer) {
        recognizer.set(options);
    } else {
        recognizer = manager.add(new Hammer[captialize(type)](options));
    }

    if (options.recognizeWith) {
        recognizer.recognizeWith(options.recognizeWith);
    }
    if (options.dropRecognizeWith) {
        recognizer.dropRecognizeWith(options.dropRecognizeWith);
    }
    if (options.requireFailure) {
        recognizer.requireFailure(options.requireFailure);
    }
    if (options.dropRequireFailure) {
        recognizer.dropRequireFailure(options.dropRequireFailure);
    }
}

export const HammerVuePlugin = {
    install(app) {
        app.directive('hammer-manager-options', {
            // Hammer.Manager.prototype.set 方法无法设置 cssProps，此配置必须在创建实例时就设置
            // 所以在 v-hammer 所需的钩子函数之前，需要根据配置项创建好 Manager 实例
            created(el, binding) {
                el.ma = new Hammer.Manager(el, binding.value);
            },
            beforeUpdate(el, binding) {
                if (el.ma && binding.value) {
                    el.ma.set(binding.value);
                }
            }
        });

        app.directive('hammer-recognizer-options', (el, binding) => {
            let ma = el.ma || (el.ma = new Hammer.Manager(el));
            let value = binding.value;
            if (!Array.isArray(value)) {
                value = [value];
            }

            RECOGNIZER_OPTIONS_MAP.set(el, value);
            value.forEach((options) => {
                let name = options.event || options.type;
                let defaultOptions = getRecognizerDefaultOptionsFromEventName(name) || {};
                setupRecognizer(ma, Object.assign(defaultOptions, options));
            });
        });

        app.directive('hammer', {
            mounted(el, binding) {
                let ma = el.ma || (el.ma = new Hammer.Manager(el));
                let { arg, value } = binding;

                // 设置对应的识别器，如果是自定义事件需要通过识别器指令设置
                let type = getRecognizerTypeFromEventName(arg);
                if (type !== 'custom') {
                    let options = getRecognizerDefaultOptionsFromEventName(arg) || { type };

                    // 当识别器配置指令先调用时有用（即：在 template 中先绑定识别器配置指令），取绑定的配置覆盖默认配置
                    let bindingOptions = RECOGNIZER_OPTIONS_MAP.get(el);
                    if (bindingOptions) {
                        Object.assign(options, bindingOptions.find((options) => (options.event || options.type) === arg));
                    }

                    setupRecognizer(ma, options);
                }

                // 添加事件监听器
                if (typeof value === 'function') {
                    ma.on(arg, value);
                }
            },
            updated(el, binding) {
                let ma = el.ma || (el.ma = new Hammer.Manager(el));
                let { arg, value, oldValue } = binding;

                // 如果事件处理函数变了，取消旧的，绑定新的
                if (value !== oldValue) {
                    if (typeof oldValue === 'function') {
                        ma.off(arg, oldValue);
                    }
                    if (typeof value === 'function') {
                        ma.on(arg, value);
                    }
                }
            },
            unmounted(el) {
                if (el.ma) {
                    el.ma.destroy();
                    el.ma = null;
                }
                RECOGNIZER_OPTIONS_MAP.delete(el);
            }
        });
    }
};
