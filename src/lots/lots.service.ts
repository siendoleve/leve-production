import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import * as moment from 'moment';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Between, Repository } from 'typeorm';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { Lot } from './entities/lot.entity';

@Injectable()
export class LotsService {
  private readonly logger = new Logger('LotsService');

  constructor(
    @InjectRepository(Lot)
    private readonly lotRepository: Repository<Lot>,
  ) {}

  /**
   * It creates a new lot and saves it to the database
   * @param {CreateLotDto} createLotDto - CreateLotDto - This is the DTO that we created earlier.
   * @returns The lot object
   */
  async create(createLotDto: CreateLotDto) {
    try {
      const lot = this.lotRepository.create(createLotDto);
      await this.lotRepository.save(lot);

      return lot;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It returns a paginated list of lots filtered by a term and a type
   * @param {string} type - string,
   * @param {string} term - The term to search for.
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns return {
   *     page,
   *     dataLots: lot,
   *   };
   */
  async findAllByTerm(
    type: string,
    term: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = 10, offset = 0 } = paginationDto;
    let lot: Lot[];
    let total: number;

    if (type === 'code') {
      lot = await this.lotRepository.find({
        take: limit,
        skip: offset,
        order: {
          createAt: 'DESC',
        },
        relations: {
          expensesPerLot: {
            expense: true,
          },
        },
        where: {
          code: term,
          status: true,
        },
      });

      total = await this.lotRepository.count({
        where: {
          code: term,
          status: true,
        },
      });
    }

    if (type === 'typeLot') {
      lot = await this.lotRepository.find({
        take: limit,
        skip: offset,
        order: {
          createAt: 'DESC',
        },
        relations: {
          expensesPerLot: {
            expense: true,
          },
        },
        where: {
          typeLot: term,
          status: true,
        },
      });

      total = await this.lotRepository.count({
        where: {
          typeLot: term,
          status: true,
        },
      });
    }

    const page = Math.ceil(total / limit);

    return {
      page,
      dataLots: lot,
    };
  }

  /**
   * It returns a paginated list of lots
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns {
   *     page,
   *     dataLots,
   *   };
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const dataLots = await this.lotRepository.find({
      order: {
        createAt: 'DESC',
      },
      take: limit,
      skip: offset,
      relations: {
        expensesPerLot: {
          expense: true,
        },
      },
      where: {
        status: true,
      },
    });

    const total = await this.lotRepository.count({
      where: {
        status: true,
      },
    });

    const page = Math.ceil(total / limit);

    return {
      page,
      dataLots,
    };
  }

  /**
   * It finds a lot by its id and returns it if it exists
   * @param {string} term - The term to search for.
   * @returns A lot object
   */
  async findOne(term: string) {
    let lot: Lot;

    lot = await this.lotRepository.findOne({
      relations: {
        expensesPerLot: {
          expense: true,
        },
      },
      where: {
        id: term,
        status: true,
      },
    });

    if (!lot) throw new NotFoundException(`Lot with id ${term} not found`);

    return lot;
  }

  /**
   * It takes an id and an updateLotDto object, and then it tries to find a lot with that id, and if it
   * finds one, it updates it with the updateLotDto object
   * @param {string} id - string - the id of the lot to update
   * @param {UpdateLotDto} updateLotDto - UpdateLotDto
   * @returns The updated lot
   */
  async update(id: string, updateLotDto: UpdateLotDto) {
    try {
      const lot = await this.lotRepository.preload({
        id,
        ...updateLotDto,
      });

      if (!lot) throw new NotFoundException(`lot with id: ${id} not found`);

      return this.lotRepository.save(lot);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds a lot by id, sets its status to false, and saves it
   * @param {string} id - string - the id of the lot to be deleted
   */
  async remove(id: string) {
    const lot = await this.findOne(id);

    lot.status = false;

    await this.lotRepository.save(lot);
  }

  /**
   * It finds all the lots that are active and were created between the initDate and endDate, and then
   * sums up the quantityLiters of all the lots
   * @param {string} initDate - string, endDate: string
   * @param {string} endDate - string, initDate: string
   */
  async findProduction(initDate: string, endDate: string) {
    const lots = await this.lotRepository.find({
      where: {
        status: true,
        createAt: Between(initDate, endDate),
      },
    });

    let total = 0;
    lots.forEach((lot) => {
      total += lot.quantityLiters;
    });

    return {
      total,
    };
  }

  /**
   * It returns the last 20 lots that are active, with their sales and expenses, ordered by creation
   * date
   * @returns An object with the lots array
   */
  async findLotsWhitReport() {
    const lots = await this.lotRepository.find({
      where: {
        status: true,
      },
      relations: {
        sale: true,
        expensesPerLot: true,
      },
      order: {
        createAt: 'DESC',
      },
      take: 20,
    });

    const lotName = [];
    const expense = [];
    const proceeds = [];

    lots.forEach((lot: any) => {
      let total = 0;
      let exp = 0;
      lotName.push(lot.code);
      if (lot.sale.length > 0) {
        lot.sale.forEach((el: any) => {
          total = total + el.totalprice;
        });
        proceeds.push(total);
      } else {
        proceeds.push(0);
      }

      if (lot.expensesPerLot.length > 0) {
        lot.expensesPerLot.forEach((el: any) => {
          exp = exp + el.value;
        });
        expense.push(exp);
      } else {
        expense.push(0);
      }
    });

    return {
      lotName,
      expense,
      proceeds,
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
