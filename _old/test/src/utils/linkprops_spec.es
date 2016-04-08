import magic from 'matreshka-magic';
import MK from 'matreshka';


describe('linkProps', () => {
	it('adds simple dependency', () => {
		let obj = {
			a: 1,
			b: 2
		};

		magic.linkProps(obj, 'c', 'a b', (a, b) => a + b);
		expect(obj.c).toEqual(3);
		obj.a = 3;
		expect(obj.c).toEqual(5);
		obj.b = 3;
		expect(obj.c).toEqual(6);
	});

	it('adds simple dependency via Matreshka instance method', () => {
		let mk = new MK;
		mk.a = 1;
		mk.b = 2;

		mk.linkProps('c', 'a b', (a, b) => a + b);
		expect(mk.c).toEqual(3);
		mk.a = 3;
		expect(mk.c).toEqual(5);
		mk.b = 3;
		expect(mk.c).toEqual(6);
	});

	it('adds dependency from another object', () => {
		let obj = {
				a: 1,
				b: 2
			},
			obj2 = {
				c: 4,
				d: 8
			};

		magic.linkProps(obj, 'e', [
			obj, ['a', 'b'],
			obj2, 'c d'
		], (a, b, c, d) => a + b + c + d);

		expect(obj.e).toEqual(15);
	});

	it('doesn\'t sets on init (setOnInit)', () => {
		let obj = {
			a: 1,
			b: 2,
			c: 0
		};

		magic.linkProps(obj, 'c', 'a b', (a, b) => a + b, false);

		expect(obj.c).toEqual(0);
	});

	it('saves from cyclical links', () => {
		let obj = {
			a: 1,
			b: 2,
			c: 3
		};

		magic.linkProps(obj, 'a', 'b c', (x, y) => x + y);
		magic.linkProps(obj, 'b', 'a c', (x, y) => x + y);
		magic.linkProps(obj, 'c', 'a b', (x, y) => x + y);

		expect(obj.a).toEqual(27);
	});

	it('allows deep dependencies', () => {
		let obj = {
			a: {b: { c: 1 }}
		},
		a,
		b;

		magic.linkProps(obj, 'd', 'a.b.c', (c) => c);
		expect(obj.d).toEqual(1);
		obj.a.b.c = 2;
		expect(obj.d).toEqual(2);
		b = obj.a.b;
		obj.a.b = {c: 3};
		b.c = 'nope';
		expect(obj.d).toEqual(3);
		a = obj.a;
		obj.a = {b: {c: 4}};
		a.b = {c: 'nope'};
		expect(obj.d).toEqual(4);
	});

	it('allows deep dependencies from another object', () => {
		let obj = {
				a: 1
			},
			obj2 = {
				b: {c: {d: 2}}
			};

		magic.linkProps(obj, 'd', [
			obj2, 'b.c.d'
		], (c) => c*2);

		expect(obj.d).toEqual(4);
	});

	it('uses event options', () => {
		let obj = {},
			i = 0;

		magic.linkProps(obj, 'c', 'a b', (a, b) => a + b, {foo: 'bar'});

		magic.on(obj, 'change:c', evt => {
			expect(evt.foo).toEqual('bar');
		});

		obj.a = 2;
		obj.b = 3;
	});

	it('uses silent: true in event options', () => {
		let obj = {},
			i = 0;

		magic.on(obj, 'change:c', evt => {
			i++;
		});

		magic.linkProps(obj, 'c', 'a b', (a, b) => a + b, {silent: true});

		obj.a = 2;
		obj.b = 3;

		expect(i).toEqual(0);
	});

	it('allows to debounce handler', done => {
		let obj = {
				a: 1,
				b: 2
			},
			i = 0;

		magic.on(obj, 'change:c', evt => {
			expect(obj.c).toEqual(5);
		});

		magic.linkProps(obj, 'c', 'a b', (a, b) => {
			i++;
			return a + b;
		}, {debounce: true});


		obj.a = 2;
		obj.b = 3;

		setTimeout(() => {
			expect(i).toEqual(1);
			done();
		}, 400);
	});
});
