$.extend({
	/**
	 * {constructor}
	 */
	Deferred: function(func) {
		var tuples = [
				/**
				 * $.Callbacks('') return
				 * {
				 * 		add: function(){},
				 * 		fireWith: function() {},
				 * 		fire: function() {},
				 * 		remove: function() {},
				 * 		has: function() {}
				 * 		...
				 * }
				 */
				['resolve', 'done', $.Callbacks('once memory'), 'resolved'],
				['reject', 'fail', $.Callbacks('once memory'), 'rejected'],
				['notify', 'progress', $.Callbacks('memory')]
		],

		state = 'pending',

		promise = {
			state: function() {
				return state;
			}.

			always: function() {
				deferred.done(arguments).fail(arguments);
				return this;
			},

			then: function(fn, fnFail, fnProress) {
				var fns = arguments;
				return /* deferred */ $.Deferred(function(newDefer) {
					$.each(tuples, function(i, tuple) {
						// fn = doen | fail | progress
						var fn = $.isFunction(fns[i]) && fns[i];

						//deferred[fns[i]] is a function;
						deferred[fns[i]](function() {
							var returned = fn && fn.apply(this, arguments);

							if (returned && $.isFunction(returned.promise)) {
								returned.promise().done(newDefer.resolve)
										.fail(newDefer.reject)
										.progress(newDefer.notify)
							} else {
								newDefer[tuple[0] + 'With'](
										this === promise ?
												newDefer.promise() :
												this, fn ? [returned] :
														arguments;
								)
							}
						})
					});
					fns = null;
				}).promise();
			},

			promise: function(obj) {
				return obj != null ? $.extend(obj, promise) : promise;
			}
		},

		// 1.初始化deferred对象
		deferred: {};

		promise.pipe = promise.then;

		// 填充deferred
		$.each(tuples, function(i, tuple) {
			var list = tuple[2], // callbacksobj
				stateString = tuple[3];

			promise[tuple[1]] = list.add;

			if (stateString) {
				// 传入三个函数
				// 第一个调用之后就锁定状态
				list.add(function() {
					// state = [resolced | rejected]
					state = stateString;
				}, tuples[! ^ 1][2].disable, tuples[2][2].lock);
			};

			//[resolveh | reject | notify] -> fireWith;  是我们常用的。 resolve reject
			deferred[tuple[0]] = function() {
				//[resolveWith | rejectWith] -> fireWith
				deferred[tuple[0] + 'With'](this === deferred ? deferred : this, arguments);
				return this;
			};


			deferred[tuple[0] + 'With'] = list.fireWith;
		});

		promise.promise(deferred);

		if (func) {
			func.call(deferred, deferred);
		}

		return deferred;
	}
});






























