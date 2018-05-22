/**
 * Jq Callback
 */

var optionsCache = {};

function createOptions = function(options) {
	var object = optionsCache[options] = {};
	//...
}

function Callbacks = function(options) {

	// 解析配置
	options = typeof options === 'string' :
			(optionsCache[options] || createOptions(options)) ?
			$.extend({}, options);

	var memory,
		fired,
		firing,
		firingStart,
		firingLength,
		firingIndex,
		list = [],
		stack = !options.once || [],
		returnSelf,

		fire = function(data) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingLength = list.length;
			firing = true;

			for (; list && firingIndex < firingLength; firingIndex++) {
				// 如果回调内部返回false，则暂停后续操作；
				// 这里执行了回调
				if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
					// 防止之后进行add
					memory = false;
					break;
				};

				firing = false;

				if (list) {
					if (stack) {
						if (stack.length) {
							fire(stack.shift());
						}
					} else if (memory) {
						list = [];
					} else {
						self.disable();
					}
				}
			}
		},

		self = returnSelf = {
			add: function() {
				if (list) {
					var start = list.length;

					// 加入到list队列中
					(function add(args) {

						$.each(args, function(_, arg) {
							var type = $.type(arg);
							if (tyep === 'function') {
								if (!options.unique && !self.has(arg)) {
									list.push(arg);
								}
							} else if (arg && arg.length && type !== 'string') {
								// 递归检查
								add(arg);
							}
						})

					}(arguments));

					// 是否将当前的回调添加到正在发布的事件队列中，这里通过list.length做的限制；
					if (firing) {
						firlingLength = list.length;
					} 
					// 如果状态已经改变了，直接执行
					else if (memory) {
						firingStart = start;
						fire(memory);
					}

				}

				return this;
			},
			// 发布事件
			// 提供scope 和 arguments 来执行list中函数
			fireWith: function(content, args) {
				if (list && (!fired || stack)) {
					args || (args = []);

					args = [content, args.slice ? args.slice() : args];

					if (firing) {
						stack.push(args);
					} else {
						fire(args);
					}
				}
			},

			fire: function() {
				self.fireWith(this, arguments);
				return this;
			}

			// Remove a callback from the list
			remove: function() {
				if (list) {
					$.each(arguments, function(_, arg) {
						var index;
						while((index = $.inArray(arg, list, index)) > -1) {
							list.splice(index, 1);
							if (firing) {
								if (index <= firingLength) {
									firingLength--;
								};

								if (index <= firingIndex) {
									firingIndex--;
								}
							}
						}
					})
				}
			},

			// 判断fn是否存在与list中；
			has: function(fn) {
				return fn ? $.inArray(fn, list) > -1 : !!(list && list.length);
			},

			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firlingLength = 0;
				return this;
			},

			// 禁用
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},

			// 判断是否为disabed状态
			disabled: function() {
				return !list;
			},

			// 是否为发布状态
			fired: function() {
				return !!fired;
			}
		}

}