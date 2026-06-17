with Ada.Real_Time; use Ada.Real_Time;

package body Merge_Sort is

   function Sort (Input_Arr : Element_Vectors.Vector) return Sort_Result is
      Start_Time  : constant Time := Clock;
      Result      : Sort_Result;
      Arr         : Element_Vectors.Vector := Input_Arr;
      N           : constant Natural := Natural (Arr.Length);
      Step_Count  : Integer := 0;
      Max_Steps   : constant Integer := 2000;

      procedure Add_Step (Action : Action_Kind; I, J : Integer) is
         Step : Trace_Step;
      begin
         if Step_Count >= Max_Steps then return; end if;
         Step_Count := Step_Count + 1;
         Step.Step_Num := Step_Count;
         Step.Action := Action;
         if I >= 0 then
            Step.Indices.Append (I);
         end if;
         if J >= 0 then
            Step.Indices.Append (J);
         end if;
         Step.Arr := Arr;
         Result.Trace.Append (Step);
      end Add_Step;

      procedure Merge (Low, Mid, High : Integer) is
         Temp : Element_Vectors.Vector;
         I    : Integer := Low;
         J    : Integer := Mid + 1;
      begin
         -- Merge elements into Temp vector
         while I <= Mid and J <= High loop
            -- Record comparison of left and right segments
            Add_Step (Compare, I - 1, J - 1);
            Result.Comparisons := Result.Comparisons + 1;
            Result.Operations := Result.Operations + 1;

            if Arr.Element (I) <= Arr.Element (J) then
               Temp.Append (Arr.Element (I));
               I := I + 1;
            else
               Temp.Append (Arr.Element (J));
               J := J + 1;
            end if;
            Result.Operations := Result.Operations + 1; -- Temp append
         end loop;

         while I <= Mid loop
            Temp.Append (Arr.Element (I));
            I := I + 1;
            Result.Operations := Result.Operations + 1;
         end loop;

         while J <= High loop
            Temp.Append (Arr.Element (J));
            J := J + 1;
            Result.Operations := Result.Operations + 1;
         end loop;

         -- Copy elements back to main array
         for K in 1 .. Integer (Temp.Length) loop
            declare
               Write_Idx : constant Integer := Low + K - 1;
               Val       : constant Integer := Temp.Element (K);
            begin
               Arr.Replace_Element (Write_Idx, Val);
               Result.Operations := Result.Operations + 1; -- Write back

               -- Record Merge write action
               Add_Step (Merge, Write_Idx - 1, -1);
            end;
         end loop;

         -- If we just merged the entire array, mark all as sorted
         if Low = 1 and High = N then
            for K in 1 .. N loop
               Add_Step (Sorted, K - 1, -1);
            end loop;
         end if;
      end Merge;

      procedure Merge_Sort_Rec (Low, High : Integer) is
         Mid : Integer;
      begin
         if Low < High then
            Mid := Low + (High - Low) / 2;
            Merge_Sort_Rec (Low, Mid);
            Merge_Sort_Rec (Mid + 1, High);
            Merge (Low, Mid, High);
         end if;
      end Merge_Sort_Rec;

   begin
      Result.Comparisons := 0;
      Result.Swaps := 0;
      Result.Operations := 0;

      if N > 0 then
         Merge_Sort_Rec (1, N);
      end if;

      -- Record elapsed time
      declare
         Elapsed : constant Time_Span := Clock - Start_Time;
         Elapsed_Sec : constant Duration := To_Duration (Elapsed);
      begin
         Result.Time_Ms := Float (Elapsed_Sec) * 1000.0;
      end;

      return Result;
   end Sort;

end Merge_Sort;
