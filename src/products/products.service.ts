import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  /**
   * The constructor function is used to inject the Product repository into the ProductService class
   * @param productRepository - Repository<Product>
   */
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * It creates a new product using the data from the createProductDto object and saves it to the
   * database
   * @param {CreateProductDto} createProductDto - CreateProductDto - This is the DTO that we created
   * earlier.
   * @returns The product that was created.
   */
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It takes a paginationDto object as an argument, and returns a list of products
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns An array of products
   */
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      where: {
        status: true,
      },
    });
  }

  /**
   * It takes a string as an argument, checks if it's a valid UUID, if it is, it searches for a product
   * with that ID, if it's not, it searches for a product with that title
   * @param {string} term - string - The term to search for.
   * @returns A product
   */
  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOne({
        where: {
          id: term,
          status: true,
        },
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('title =lower(:title)', {
          title: term,
        })
        .andWhere('status=true')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);

    return product;
  }

  /**
   * It takes an id and an updateProductDto, then it tries to find a product with that id, if it
   * doesn't find one it throws a NotFoundException, if it does find one it returns the product
   * @param {string} id - The id of the product to update.
   * @param {UpdateProductDto} updateProductDto - UpdateProductDto
   * @returns The product that was updated.
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
      });

      if (!product)
        throw new NotFoundException(`Product whit id: ${id} not found`);

      return this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds a product by id, sets its status to false, and saves it
   * @param {string} id - The id of the product to be deleted.
   */
  async remove(id: string) {
    const product = await this.findOne(id);

    product.status = false;

    await this.productRepository.save(product);
  }

  /**
   * If the error code is 23505, throw a BadRequestException, otherwise throw an
   * InternalServerErrorException
   * @param {any} error - any - the error object that was thrown
   */
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
