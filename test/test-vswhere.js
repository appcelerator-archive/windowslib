import path from 'path';

import { isDir } from 'appcd-fs';
import { options, vswhere } from '../dist/index';

const { getVSWhere, VSWhere } = vswhere;

const mockDir        = path.join(__dirname, 'mocks');
const vswhereMockDir = path.join(mockDir, 'vswhere');
const vswhereExe     = path.join(vswhereMockDir, 'vswhere.exe');

describe('VSWhere', () => {
	describe('constructor', () => {
		it('should error if directory is invalid', () => {
			expect(() => {
				new VSWhere(123);
			}).to.throw(TypeError, 'Expected executable to be a valid string');

			expect(() => {
				new VSWhere('');
			}).to.throw(TypeError, 'Expected executable to be a valid string');
		});

		it('should error executable does not have a .exe extension', () => {
			expect(() => {
				new VSWhere('foo');
			}).to.throw(Error, 'Executable must have a .exe extension');
		});

		it('should error if executable is not a file', () => {
			expect(() => {
				new VSWhere(`${__dirname}/foo.exe`);
			}).to.throw(Error, 'Executable does not exist or is not a file');
		});
	});

	describe('getVSWhere()', () => {
		beforeEach(function () {
			this.searchPaths = options.vswhere.searchPaths;
			options.vswhere.searchPaths = null;
		});

		afterEach(function () {
			options.vswhere.searchPaths = this.searchPaths;
		});

		it('should find mock vswhere', async function () {
			this.timeout(5000);
			this.slow(4000);

			options.vswhere.searchPaths = __dirname;
			let vswhere = await getVSWhere(true);
			expect(vswhere).to.be.null;

			options.vswhere.searchPaths = vswhereMockDir;
			vswhere = await getVSWhere(true);
			expect(vswhere).to.be.an('object');
			expect(vswhere).to.be.instanceof(VSWhere);
			expect(vswhere.exe).to.equal(vswhereExe);

			options.vswhere.searchPaths = vswhereExe;
			vswhere = await getVSWhere(true);
			expect(vswhere).to.be.an('object');
			expect(vswhere).to.be.instanceof(VSWhere);
			expect(vswhere.exe).to.equal(vswhereExe);
		});
	});

	describe('query()', () => {
		it('should error if query params is invalid', async function () {
			this.timeout(5000);
			this.slow(4000);

			const vswhere = await getVSWhere(true);
			if (vswhere) {
				expect(vswhere).to.be.instanceof(VSWhere);
				expect(vswhere.exe).to.be.a('string');

				try {
					await vswhere.query('foo');
				} catch (e) {
					expect(e).to.be.an.instanceof(TypeError);
					expect(e.message).to.equal('Expected options to be an object');
					return;
				}

				throw new Error('Expected error');
			}
		});

		it('should try to query installed products', async function () {
			this.timeout(5000);
			this.slow(4000);

			const vswhere = await getVSWhere(true);
			if (vswhere) {
				expect(vswhere).to.be.instanceof(VSWhere);
				expect(vswhere.exe).to.be.a('string');

				const products = await vswhere.query();
				expect(products).to.be.an('array');

				for (const product of products) {
					expect(product).to.be.an('object');
					expect(isDir(product.installationPath)).to.be.true;
				}
			}
		});
	});
});
