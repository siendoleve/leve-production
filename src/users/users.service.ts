import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  /**
   * It creates a new user, hashes the password, saves the user to the database, deletes the password
   * from the user object, and returns the user object with a JWT token
   * @param {CreateUserDto} createUserDto - CreateUserDto
   * @returns The user object with the token property.
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);

      delete user.password;
      const newUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return {
        ...newUser,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It takes a JwtPayload object as an argument, and returns a JWT token
   * @param {JwtPayload} payload - JwtPayload - This is the payload that we will be sending to the
   * server.
   * @returns A JWT token
   */
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  /**
   * It takes a paginationDto object as an argument, and returns a list of users
   * @param {PaginationDto} paginationDto - PaginationDto
   * @returns An array of users.
   */
  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.userRepository.find({
      take: limit,
      skip: offset,
      where: {
        status: true,
      },
    });
  }

  /**
   * It finds a user by either their id or dni, and throws an error if the user is not found
   * @param {string} term - string
   * @returns A user
   */
  async findOne(term: string) {
    let user: User;

    if (isUUID(term)) {
      user = await this.userRepository.findOne({
        where: {
          id: term,
          status: true,
        },
      });
    } else {
      const queryBuilder = this.userRepository.createQueryBuilder();
      user = await queryBuilder
        .where('dni =lower(:dni)', {
          dni: term,
        })
        .andWhere('status=true')
        .getOne();
    }

    if (!user) throw new NotFoundException(`User with term ${term} not found`);

    return user;
  }

  /**
   * It takes an id and an updateUserDto, preloads the user with the id and the updateUserDto, checks
   * if the user exists, and if it does, it saves the user
   * @param {string} id - string - The id of the user to update
   * @param {UpdateUserDto} updateUserDto - UpdateUserDto
   * @returns The user object with the updated information.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.preload({
        id,
        ...updateUserDto,
      });

      if (!user) throw new NotFoundException(`User with id: ${id} not found`);

      return this.userRepository.save(user);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * It finds a user by id, sets the status to false, and saves the user
   * @param {string} id - string - The id of the user to be deleted.
   */
  async remove(id: string) {
    const user = await this.findOne(id);

    user.status = false;

    await this.userRepository.save(user);
  }

  /**
   * We're taking the loginUserDto object, destructuring it to get the password and email, then we're
   * using the userRepository to find a user with the email that was passed in. If the user exists,
   * we're comparing the password that was passed in with the password that's stored in the database.
   * If the passwords match, we're deleting the password from the user object and returning the user
   * object with a token
   * @param {LoginUserDto} loginUserDto - LoginUserDto - This is the DTO that we created earlier.
   * @returns {
   *     ...user,
   *     token: this.getJwtToken({ id: user.id }),
   *   };
   */
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        email: true,
        password: true,
        id: true,
        name: true,
      },
    });

    if (!user) throw new UnauthorizedException(`Credential are not valid`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid');

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  /**
   * It takes a user object, adds a token property to it, and returns the new object
   * @param {User} user - User - the user object that was returned from the login/register function
   * @returns The user object with the token property added to it.
   */
  async checkAuthStatus(user: User) {
    const newUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      ...newUser,
      token: this.getJwtToken({ id: user.id }),
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
