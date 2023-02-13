import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Lot } from 'src/lots/entities/lot.entity';
import { Between, Repository } from 'typeorm';
import { CreateExpensesPerLotDto } from './dto/create-expenses-per-lot.dto';
import { UpdateExpensesPerLotDto } from './dto/update-expenses-per-lot.dto';
import { ExpensesPerLot } from './entities/expenses-per-lot.entity';
import { Expense } from 'src/expenses/entities/expense.entity';

@Injectable()
export class ExpensesPerLotsService {
  private readonly logger = new Logger('ExpensesPerLotsService');

  constructor(
    @InjectRepository(ExpensesPerLot)
    private readonly expensesPerLotRepository: Repository<ExpensesPerLot>,

    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {}

  /**
   * It creates a new expensesPerLot object using the createExpensesPerLotDto object and saves it to
   * the database
   * @param {CreateExpensesPerLotDto} createExpensesPerLotDto - CreateExpensesPerLotDto
   */
  async create(createExpensesPerLotDto: CreateExpensesPerLotDto) {
    try {
      const { lotId, expenseId } = createExpensesPerLotDto;

      const lot = await this.lotRepository.findOne({
        where: {
          id: lotId,
          status: true,
        },
      });

      const expense = await this.expenseRepository.findOne({
        where: {
          id: expenseId,
          status: true,
        },
      });

      const value = expense.value;

      const expensePerLot = this.expensesPerLotRepository.create({
        lot,
        expense,
        value,
      });

      return this.expensesPerLotRepository.save(expensePerLot);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It takes a paginationDto object as an argument, and returns an array of expensesPerLotRepository
   * objects
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns An array of ExpensesPerLot objects
   */
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.expensesPerLotRepository.find({
      take: limit,
      skip: offset,
      where: {
        status: true,
      },
    });
  }

  /**
   * It finds an ExpensesPerLot by id and returns it if it exists
   * @param {string} id - string - The id of the expensesPerLot we want to find.
   * @returns The expensesPerLot object
   */
  async findOne(id: string) {
    const expensesPerLot = this.expensesPerLotRepository.findOne({
      where: {
        id,
        status: true,
      },
    });

    if (!expensesPerLot)
      throw new NotFoundException(`ExpensesPerLot with id ${id} not found`);

    return expensesPerLot;
  }

  /**
   * It takes an id and an updateExpensesPerLotDto, and then it tries to find an expensesPerLot with
   * that id, and if it finds one, it updates it with the updateExpensesPerLotDto
   * @param {string} id - string - The id of the expensesPerLot to update.
   * @param {UpdateExpensesPerLotDto} updateExpensesPerLotDto - UpdateExpensesPerLotDto
   * @returns The updated expensesPerLot
   */
  async update(id: string, updateExpensesPerLotDto: UpdateExpensesPerLotDto) {
    try {
      const expensesPerLot = await this.expensesPerLotRepository.preload({
        id,
        ...updateExpensesPerLotDto,
      });

      if (!expensesPerLot)
        throw new NotFoundException(`expensesPerLot whit id: ${id} not found`);

      return this.expensesPerLotRepository.save(expensesPerLot);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds an expense per lot by id, sets its status to false, and saves it
   * @param {string} id - string - The id of the expensesPerLot you want to delete.
   */
  async remove(id: string) {
    const expensesPerLot = await this.findOne(id);

    await this.expensesPerLotRepository.remove(expensesPerLot);
  }

  /**
   * It returns the total expenses of the company in a given period
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string,
   * @returns The total expenses of the expensesPerLot
   */
  async findReportOperational(initDate: string, endDate: string) {
    const expensesPerLot = await this.expensesPerLotRepository.find({
      where: {
        status: true,
        createat: Between(initDate, endDate),
      },
    });

    let totalExpenses = 0;
    expensesPerLot.forEach((expense) => {
      totalExpenses += expense.value;
    });

    return {
      totalExpenses,
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
