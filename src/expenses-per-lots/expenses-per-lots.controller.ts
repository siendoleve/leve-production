import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExpensesPerLotsService } from './expenses-per-lots.service';
import { CreateExpensesPerLotDto } from './dto/create-expenses-per-lot.dto';
import { UpdateExpensesPerLotDto } from './dto/update-expenses-per-lot.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Query } from '@nestjs/common/decorators';

@Controller('expenses-per-lots')
export class ExpensesPerLotsController {
  constructor(
    private readonly expensesPerLotsService: ExpensesPerLotsService,
  ) {}

  /* Creating a new expense per lot. */
  @Post()
  create(@Body() createExpensesPerLotDto: CreateExpensesPerLotDto) {
    return this.expensesPerLotsService.create(createExpensesPerLotDto);
  }

  @Get('report/operational')
  findReportOperational(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesPerLotsService.findReportOperational(initDate, endDate);
  }

  /* A method that is called when a GET request is made to the endpoint `expenses-per-lots`. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.expensesPerLotsService.findAll(paginationDto);
  }

  /* A method that is called when a GET request is made to the endpoint `expenses-per-lots/:term`. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.expensesPerLotsService.findOne(term);
  }

  /* Updating the expenses per lot. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpensesPerLotDto: UpdateExpensesPerLotDto,
  ) {
    return this.expensesPerLotsService.update(id, updateExpensesPerLotDto);
  }

  /* Deleting the expense per lot. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesPerLotsService.remove(id);
  }
}
