import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Between, Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger('ExpensesService');

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  /**
   * It creates an expense object from the createExpenseDto object, saves it to the database, and
   * returns the expense object
   * @param {CreateExpenseDto} createExpenseDto - CreateExpenseDto
   * @returns The expense object
   */
  async create(createExpenseDto: CreateExpenseDto) {
    try {
      const expenseSearch = await this.expenseRepository.findOne({
        where: {
          description: createExpenseDto.description.toLowerCase(),
          status: false,
        },
      });

      if (expenseSearch) {
        const id = expenseSearch.id;
        const expenseUpdated = await this.expenseRepository.preload({
          id,
          ...createExpenseDto,
          status: true,
        });

        return this.expenseRepository.save(expenseUpdated);
      }

      const expense = this.expenseRepository.create(createExpenseDto);
      await this.expenseRepository.save(expense);

      return expense;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It takes a paginationDto object as an argument, and returns an array of expenses
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns An array of Expense objects.
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const dataExpense = await this.expenseRepository.find({
      order: {
        createat: 'DESC',
      },
      take: limit,
      skip: offset,
      where: {
        status: true,
      },
    });

    const total = await this.expenseRepository.count({
      where: {
        status: true,
      },
    });

    const page = Math.ceil(total / limit);

    return {
      dataExpense,
      page,
    };
  }

  async findAllExpenseByType(term: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const dataExpense = await this.expenseRepository.find({
      take: limit,
      skip: offset,
      order: {
        createat: 'DESC',
      },
      where: {
        status: true,
        type: term,
      },
    });

    const total = await this.expenseRepository.count({
      where: {
        status: true,
        type: term,
      },
    });

    const page = Math.ceil(total / limit);

    return {
      dataExpense,
      page,
    };
  }

  /**
   * It finds an expense by id and returns it if it exists
   * @param {string} id - string - The id of the expense we want to find.
   * @returns The expense object
   */
  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({
      where: {
        id,
        status: true,
      },
    });

    if (!expense)
      throw new NotFoundException(`Expense with id: ${id} not found`);

    return expense;
  }

  /**
   * It takes an id and an updateExpenseDto, preloads the expense with the id and the updateExpenseDto,
   * throws an error if the expense doesn't exist, and then saves the expense
   * @param {string} id - string - the id of the expense to update
   * @param {UpdateExpenseDto} updateExpenseDto - UpdateExpenseDto
   * @returns The updated expense
   */
  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      const expense = await this.expenseRepository.preload({
        id,
        ...updateExpenseDto,
      });

      if (!expense)
        throw new NotFoundException(`expense with id: ${id} not found`);

      return this.expenseRepository.save(expense);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds an expense by id, sets its status to false, and saves it
   * @param {string} id - string - the id of the expense to be deleted
   */
  async remove(id: string) {
    const expense = await this.findOne(id);

    expense.status = false;

    await this.expenseRepository.save(expense);
  }

  /**
   * It finds all expenses that are active, have a type of 'administrativo', and were created between
   * the initDate and endDate
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string,
   * @returns The total expense of the administrative expenses.
   */
  async findReportAdmin(initDate: string, endDate: string) {
    const expenseAdmin = await this.expenseRepository.find({
      where: {
        status: true,
        createat: Between(initDate, endDate),
        type: 'administrativo',
      },
    });

    let totalExpense = 0;
    expenseAdmin.forEach((expense) => {
      totalExpense += expense.value;
    });

    return {
      totalExpense,
    };
  }

  /**
   * It finds all the expenses that are advertising, between two dates, and returns the total value of
   * those expenses
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string,
   * @returns {
   *     totalExpense,
   *   };
   */
  async findReportAdvertising(initDate: string, endDate: string) {
    const expenseAdv = await this.expenseRepository.find({
      where: {
        status: true,
        createat: Between(initDate, endDate),
        type: 'publicidad',
      },
    });

    let totalExpense = 0;
    expenseAdv.forEach((expense) => {
      totalExpense += expense.value;
    });

    return {
      totalExpense,
    };
  }

  /**
   * It finds all the expenses that are of type 'other' and that were created between the initDate and
   * endDate, and then it sums up the value of all those expenses
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string,
   * @returns The total expense of the expenses that are of type 'otros'
   */
  async findReportOther(initDate: string, endDate: string) {
    const expenseOther = await this.expenseRepository.find({
      where: {
        status: true,
        createat: Between(initDate, endDate),
        type: 'otros',
      },
    });

    let totalExpense = 0;
    expenseOther.forEach((expense) => {
      totalExpense += expense.value;
    });

    return {
      totalExpense,
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
