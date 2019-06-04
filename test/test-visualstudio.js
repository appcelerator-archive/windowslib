import { vs } from '../dist/index';

describe('Visual Studio', () => {
	describe('constructor', () => {
		it('should error if info is not an object', () => {
			expect(() => {
				new vs.VisualStudio();
			}).to.throw(TypeError, 'Expected info to be an object');

			expect(() => {
				new vs.VisualStudio('foo');
			}).to.throw(TypeError, 'Expected info to be an object');
		});

		it('should error if info has invalid display name', () => {
			expect(() => {
				new vs.VisualStudio({});
			}).to.throw(TypeError, 'Expected display name to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: null
				});
			}).to.throw(TypeError, 'Expected display name to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: ''
				});
			}).to.throw(TypeError, 'Expected display name to be a string');
		});

		it('should error if info has invalid installation path', () => {
			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo'
				});
			}).to.throw(TypeError, 'Expected installation path to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo',
					installationPath: null
				});
			}).to.throw(TypeError, 'Expected installation path to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo',
					installationPath: ''
				});
			}).to.throw(TypeError, 'Expected installation path to be a string');
		});

		it('should error if info has invalid installation version', () => {
			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo',
					installationPath: 'bar'
				});
			}).to.throw(TypeError, 'Expected installation version to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo',
					installationPath: 'bar',
					installationVersion: null
				});
			}).to.throw(TypeError, 'Expected installation version to be a string');

			expect(() => {
				new vs.VisualStudio({
					displayName: 'foo',
					installationPath: 'bar',
					installationVersion: ''
				});
			}).to.throw(TypeError, 'Expected installation version to be a string');
		});
	});

	describe('getVisualStudios()', () => {
		it('should detect installed Visual Studios', async () => {
			const results = await vs.getVisualStudios(true);
			expect(results).to.be.an('array');
			for (const result of results) {
				expect(result).to.be.an('object');
			}
		});
	});
});
