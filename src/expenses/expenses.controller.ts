import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /* A post request that takes in a body and returns a response. */
  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  /* A get request that takes in a query and returns a response. */
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.expensesService.findAll(paginationDto);
  }

  @Get('/report/admin')
  findReportAdmin(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesService.findReportAdmin(initDate, endDate);
  }

  @Get('/report/advertising')
  findReportAdvertising(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesService.findReportAdvertising(initDate, endDate);
  }

  @Get('/report/other')
  findReportOther(
    @Query('initDate') initDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expensesService.findReportOther(initDate, endDate);
  }

  @Get('/type/:term')
  findAllExpenseOperation(
    @Param('term') term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.expensesService.findAllExpenseByType(term, paginationDto);
  }

  /* A get request that takes in a param and returns a response. */
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.expensesService.findOne(term);
  }

  /* A patch request that takes in a param and a body and returns a response. */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  /* A delete request that takes in a param and returns a response. */
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.remove(id);
  }
}
