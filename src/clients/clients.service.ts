import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNumber, isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Between, Repository } from 'typeorm';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger('ClientsService');

  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  /**
   * It creates a new client using the data from the createClientDto object and saves it to the
   * database
   * @param {CreateClientDto} createClientDto - CreateClientDto
   * @returns The client object
   */
  async create(createClientDto: CreateClientDto) {
    try {
      const bdClient = await this.clientRepository.findOne({
        where: {
          email: createClientDto.email.toLowerCase(),
          status: false,
        },
      });

      console.log(bdClient);

      if (bdClient) {
        const id = bdClient.id;
        const clientUp = await this.clientRepository.preload({
          id,
          ...createClientDto,
          status: true,
        });

        return this.clientRepository.save(clientUp);
      }

      const client = this.clientRepository.create(createClientDto);
      await this.clientRepository.save(client);

      return client;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It takes a paginationDto object as an argument, and returns a list of clients
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns An array of clients
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const total = await this.clientRepository.count({
      where: {
        status: true,
      },
    });

    const dataClients = await this.clientRepository.find({
      take: limit,
      skip: offset,
      where: {
        status: true,
      },
    });

    const page = Math.ceil(total / limit);

    return {
      dataClients,
      page,
    };
  }

  /**
   * It finds a client by its id or dni, and if it doesn't find it, it throws a NotFoundException
   * @param {string} term - string
   * @returns A client object
   */
  async findOne(term: string) {
    let client: Client;

    if (isUUID(term)) {
      client = await this.clientRepository.findOne({
        where: {
          id: term,
          status: true,
        },
      });
    } else {
      const queryBuilder = this.clientRepository.createQueryBuilder();
      client = await queryBuilder
        .where('dni =lower(:dni)', {
          dni: term,
        })
        .andWhere('status=true')
        .getOne();
    }

    if (!client)
      throw new NotFoundException(`Client with term ${term} not found`);

    return client;
  }

  /**
   * It takes a term and a paginationDto, and returns an object with the dataClients and the page
   * @param {string} term - string
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns an object with the dataClients and the page
   */
  async findAllByTerm(term: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    let total: number;
    let client: Client[];
    if (isNumber(parseInt(term))) {
      client = await this.clientRepository.find({
        take: limit,
        skip: offset,
        where: {
          dni: term,
          status: true,
        },
      });

      total = 0;
    } else {
      const queryBuilder = this.clientRepository.createQueryBuilder();
      client = await queryBuilder
        .take(limit)
        .skip(offset)
        .where('name like lower(:name)', {
          name: `%${term}%`,
        })
        .andWhere('status=true')
        .getMany();

      const count = await queryBuilder
        .select('COUNT(id)', 'count')
        .where('name like lower(:name)', {
          name: `%${term}%`,
        })
        .andWhere('status=true')
        .getRawOne();

      total = +count?.count | 0;
    }

    const page = Math.ceil(total / limit);

    return {
      dataClients: client,
      page,
    };
  }

  /**
   * It takes an id and an updateClientDto, and then it tries to find a client with that id, and if it
   * finds one, it updates it with the updateClientDto
   * @param {string} id - string - The id of the client to update.
   * @param {UpdateClientDto} updateClientDto - UpdateClientDto
   * @returns The client that was updated.
   */
  async update(id: string, updateClientDto: UpdateClientDto) {
    try {
      const client = await this.clientRepository.preload({
        id,
        ...updateClientDto,
      });

      if (!client)
        throw new NotFoundException(`Client whit id: ${id} not found`);

      return this.clientRepository.save(client);
    } catch (error) {}
  }

  /**
   * It finds a client by id, sets its status to false, and saves it
   * @param {string} id - string - The id of the client to be deleted.
   */
  async remove(id: string) {
    const client = await this.findOne(id);

    client.status = false;

    await this.clientRepository.save(client);
  }

  /**
   * It returns the number of clients created between two dates
   * @param {string} initDate - The initial date of the period to be searched.
   * @param {string} endDate - string - The end date of the period you want to search for.
   * @returns The number of clients that were created between the two dates.
   */
  async findNewClients(initDate: string, endDate: string) {
    const clients = await this.clientRepository.count({
      where: {
        status: true,
        createAt: Between(initDate, endDate),
      },
    });

    return {
      clients,
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
