import { Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/clients/entities/client.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Lot } from 'src/lots/entities/lot.entity';
import { Product } from 'src/products/entities/product.entity';
import { Repository } from 'typeorm';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';
import { Like } from 'typeorm';
import { Between } from 'typeorm';
import { ExpensesPerLot } from 'src/expenses-per-lots/entities/expenses-per-lot.entity';
import { Expense } from 'src/expenses/entities/expense.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger('SalesService');

  /**
   * The constructor function is used to inject the Sale repository into the SaleService class
   * @param saleRepository - Repository<Sale>
   */
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ExpensesPerLot)
    private readonly expensesPerLotRepository: Repository<ExpensesPerLot>,

    @InjectRepository(Expense)
    private readonly expense: Repository<Expense>,
  ) {}

  /**
   * It creates a sale
   * @param {CreateSaleDto} createSaleDto - CreateSaleDto
   * @returns The sale object
   */
  async create(createSaleDto: CreateSaleDto) {
    try {
      const { clientId, lotId, productId, quantity, totalprice } =
        createSaleDto;

      const client = await this.clientRepository.findOne({
        where: {
          id: clientId,
          status: true,
        },
      });

      const lot = await this.lotRepository.findOne({
        where: {
          id: lotId,
          status: true,
        },
      });

      const product = await this.productRepository.findOne({
        where: {
          id: productId,
          status: true,
        },
      });

      const sale = this.saleRepository.create({
        client,
        lot,
        product,
        quantity,
        totalprice,
      });

      return await this.saleRepository.save(sale);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It returns a paginated list of sales
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns the page and the dataSale.
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const total = await this.saleRepository.count({
      where: {
        status: true,
      },
    });

    const dataSale = await this.saleRepository.find({
      take: limit,
      skip: offset,
      order: {
        createat: 'DESC',
      },
      where: {
        status: true,
      },
    });

    const page = Math.ceil(total / limit);

    return {
      page,
      dataSale,
    };
  }

  /**
   * It returns a paginated list of sales filtered by a term and a type
   * @param {string} type - The type of search you want to do.
   * @param {string} term - The term to search for.
   * @param {PaginationDto} paginationDto - PaginationDto: This is the object that contains the limit
   * and offset parameters.
   * @returns return {
   *     page,
   *     dataSale: sale,
   *   };
   */
  async findAllByTerm(
    type: string,
    term: string,
    paginationDto: PaginationDto,
  ) {
    let sale: Sale[];

    const { limit = 10, offset = 0 } = paginationDto;
    let total: number;
    if (type === 'product') {
      sale = await this.saleRepository.find({
        take: limit,
        skip: offset,
        order: {
          createat: 'DESC',
        },
        where: {
          product: {
            id: term,
          },
          status: true,
        },
      });

      total = await this.saleRepository.count({
        where: {
          product: {
            id: term,
          },
          status: true,
        },
      });
    }

    if (type === 'client') {
      sale = await this.saleRepository.find({
        take: limit,
        skip: offset,
        order: {
          createat: 'DESC',
        },
        where: {
          client: {
            name: Like(`%${term}%`),
          },
          status: true,
        },
      });

      total = await this.saleRepository.count({
        where: {
          client: {
            name: Like(`%${term}%`),
          },
          status: true,
        },
      });
    }

    const page = Math.ceil(total / limit);

    return {
      page,
      dataSale: sale,
    };
  }

  /**
   * It finds a sale by id and returns it if it exists
   * @param {string} id - string - The id of the sale we want to find.
   * @returns The sale object
   */
  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({
      where: {
        id,
        status: true,
      },
    });

    if (!sale) throw new NotFoundException(`Sale with id: ${id} not found`);

    return sale;
  }

  /**
   * It takes an id and an updateSaleDto object, finds the sale with the given id, and updates it with
   * the data from the updateSaleDto object
   * @param {string} id - string - The id of the sale we want to update
   * @param {UpdateSaleDto} updateSaleDto - UpdateSaleDto
   * @returns The updated sale
   */
  async update(id: string, updateSaleDto: UpdateSaleDto) {
    try {
      const { clientId, lotId, productId, quantity, totalprice } =
        updateSaleDto;

      const client = await this.clientRepository.findOne({
        where: {
          id: clientId,
          status: true,
        },
      });

      const lot = await this.lotRepository.findOne({
        where: {
          id: lotId,
          status: true,
        },
      });

      const product = await this.productRepository.findOne({
        where: {
          id: productId,
          status: true,
        },
      });

      const sale = await this.saleRepository.preload({
        id,
        client,
        lot,
        product,
        ...updateSaleDto,
      });

      if (!sale) throw new NotFoundException(`Sale with id: ${id} not found`);

      return this.saleRepository.save(sale);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds a sale by id, sets its status to false, and saves it
   * @param {string} id - string - The id of the sale to be removed.
   */
  async remove(id: string) {
    const sale = await this.findOne(id);

    sale.status = false;

    await this.saleRepository.save(sale);
  }

  /**
   * It's a function that returns a promise that resolves to an object with a single property, total
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string,
   * @returns {
   *     total,
   *   };
   */
  async findReportSale(initDate: string, endDate: string) {
    const total = await this.saleRepository.count({
      where: {
        status: true,
        createat: Between(initDate, endDate),
      },
    });
    return {
      total,
    };
  }

  /**
   * It finds all sales that are active and were created between the initDate and endDate, and then
   * sums up the totalPrice of all sales
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string, initDate: string
   * @returns The proceeds of the sales made between the dates passed as parameters.
   */
  async findReportProceeds(initDate: string, endDate: string) {
    const sales = await this.saleRepository.find({
      where: {
        status: true,
        createat: Between(initDate, endDate),
      },
    });

    let proceeds = 0;
    sales.forEach((sale) => {
      proceeds += sale.totalprice;
    });

    return {
      proceeds,
    };
  }

  /**
   * It returns an object with the months, proceeds, expensesOperational and otherExpensesValues
   * @param {string} initDate - string,
   * @param {string} endDate - string,
   * @returns {
   *     months: string[];
   *     proceedsValues: number[];
   *     expensesOperationalValues: number[];
   *     otherExpensesValues: number[];
   *   }
   */
  async findAbstractReportProceedsVsExpenses(
    initDate: string,
    endDate: string,
  ) {
    const proceeds = await this.saleRepository.manager.query(`
      SELECT SUM(totalprice) AS total,
      EXTRACT(MONTH FROM createat) AS month
      FROM sale
      WHERE createat BETWEEN '${initDate}' AND '${endDate}' AND status = true
      GROUP BY month
      ORDER BY month
    `);

    const expensesOperational = await this.saleRepository.manager.query(`
      SELECT SUM(value) AS total,
      EXTRACT(MONTH FROM createat) AS month
      FROM expenses_per_lot
      WHERE createat BETWEEN '${initDate}' AND '${endDate}' AND status = true
      GROUP BY month
      ORDER BY month
    `);

    const otherExpenses = await this.saleRepository.manager.query(`
      SELECT SUM(value) AS total,
      EXTRACT(MONTH FROM createat) AS month
      FROM expense
      WHERE type != 'operativos' AND createat BETWEEN '${initDate}' AND '${endDate}' AND status = true
      GROUP BY month
      ORDER BY month
    `);

    const months: string[] = [];
    const proceedsValues: number[] = [];
    const expensesOperationalValues: number[] = [];
    const otherExpensesValues: number[] = [];
    const utilities: number[] = [];
    //TODO: refactorizar esto en otra funcion y reutilizar codigo
    proceeds.forEach((proceed: { total: number; month: string }) => {
      proceedsValues.push(proceed.total);
      months.push(proceed.month);
    });
    //TODO: refactorizar esto en otra funcion y reutilizar codigo
    expensesOperational.forEach((expense: { total: number; month: string }) => {
      expensesOperationalValues.push(expense.total);
    });
    //TODO: refactorizar esto en otra funcion y reutilizar codigo
    otherExpenses.forEach((expense: { total: number; month: string }) => {
      otherExpensesValues.push(expense.total);
    });

    for (let index = 0; index < proceedsValues.length; index++) {
      const utility =
        proceedsValues[index] -
        (expensesOperationalValues[index] + otherExpensesValues[index]);
      utilities.push(utility);
    }

    return {
      months,
      proceedsValues,
      expensesOperationalValues,
      otherExpensesValues,
      utilities,
    };
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
